import { ConfigService } from "@nestjs/config";
import {
  ExternalMovie,
  MovieProvider,
  MovieSearchResult,
} from "src/domain/ports/movie_provider";
import { AppConfig } from "../configs/app_config";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";
import { MovieCertificate } from "src/domain/value_objects/movie_certificate";
import { validate } from "src/shared/utilities/validation";
import {
  TMDBMovieDetailsDTO,
  TMDBMovieDetailsDTOSchema,
  TMDBMovieSearchResultDTO,
  TMDBMovieSearchResultDTOSchema,
  TMDBReleaseDateResultDTO,
  TMDBReleaseDatesDTOSchema,
} from "./dtos/tmdb_movie_provider_dto";
import { ApplicationError } from "src/shared/exceptions/application_error";
import { Inject, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";

interface TMDBConfig {
  accessKey: string;
  apiBaseUrl: string;
  requestTimeoutMs: number;
}

interface TMDBErrorResponse {
  success: boolean;
  status_code: number;
  status_message: string;
}

interface TMDBRequestLogContext {
  operation: string;
  url: string;
  params: Record<string, unknown>;
}

export class TMDBMovieProvider implements MovieProvider {
  private readonly logger = new Logger(TMDBMovieProvider.name);
  private readonly tmdbConfig: TMDBConfig;

  public constructor(
    @Inject(ConfigService)
    config: ConfigService<AppConfig, true>,
  ) {
    this.tmdbConfig = {
      accessKey: config.get("TMDB_API_ACCESS_KEY", { infer: true }),
      apiBaseUrl: config.get("TMDB_API_BASE_URL", { infer: true }),
      requestTimeoutMs: config.get("TMDB_REQUEST_TIMEOUT_MS", { infer: true }),
    };
  }

  public async searchMovie(keyword: string): Promise<{
    results: MovieSearchResult[];
    resultCount: number;
  }> {
    const url = `${
      this.tmdbConfig.apiBaseUrl
    }/search/movie?query=${encodeURIComponent(keyword)}`;
    const response = await this.executeWithLogging(
      {
        operation: "searchMovie",
        url,
        params: { keyword },
      },
      () => this.fetchWithTimeout(url),
    );

    if (!response.ok) {
      await this.handleErrorResponse(response, "searchMovie", { keyword });
    }

    try {
      const data = await response.json();
      const dto = validate(TMDBMovieSearchResultDTOSchema, data);

      return {
        results: this.mapToMovieSearchResults(dto),
        resultCount: dto.total_results <= 10 ? dto.total_results : 10,
      };
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new InfrastructureError({
          code: InfrastructureErrorCode.EXTERNAL_API_ERROR,
          message: `TMDB API returned invalid data for searchMovie with keyword "${keyword}": ${error.message}`,
          details: error.details,
        });
      }

      throw error;
    }
  }

  public async movieOfID(externalID: string): Promise<ExternalMovie | null> {
    const url = `${this.tmdbConfig.apiBaseUrl}/movie/${encodeURIComponent(
      externalID,
    )}`;
    const response = await this.executeWithLogging(
      {
        operation: "movieOfID",
        url,
        params: { externalID },
      },
      () => this.fetchWithTimeout(url),
    );

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      await this.handleErrorResponse(response, "movieOfID", { externalID });
    }

    try {
      const data = await response.json();
      const dto = validate(TMDBMovieDetailsDTOSchema, data);

      return this.mapToExternalMovie(dto);
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new InfrastructureError({
          code: InfrastructureErrorCode.EXTERNAL_API_ERROR,
          message: `TMDB API returned invalid data for movieOfID with ID ${externalID}: ${error.message}`,
          details: error.details,
        });
      }

      throw error;
    }
  }

  public async certificate(externalID: string): Promise<string | null> {
    const url = `${this.tmdbConfig.apiBaseUrl}/movie/${encodeURIComponent(
      externalID,
    )}/release_dates`;
    const response = await this.executeWithLogging(
      {
        operation: "certifcate",
        url,
        params: { externalID },
      },
      () => this.fetchWithTimeout(url),
    );

    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      await this.handleErrorResponse(response, "certificate", { externalID });
    }

    try {
      const data = await response.json();
      const dto = validate(TMDBReleaseDatesDTOSchema, data);

      const certification = this.extractCertification(dto.results);
      return certification !== ""
        ? this.mapToMovieCertificate(certification)
        : certification;
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw new InfrastructureError({
          code: InfrastructureErrorCode.EXTERNAL_API_ERROR,
          message: `TMDB API returned invalid data for certificate with ID ${externalID}: ${error.message}`,
          details: error.details,
        });
      }

      throw error;
    }
  }

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutID = setTimeout(
      () => controller.abort(),
      this.tmdbConfig.requestTimeoutMs,
    );

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.tmdbConfig.accessKey}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new InfrastructureError({
          code: InfrastructureErrorCode.EXTERNAL_API_TIMEOUT,
          message: `TMDB API request timed out after ${this.tmdbConfig.requestTimeoutMs}ms`,
        });
      }

      throw new InfrastructureError({
        code: InfrastructureErrorCode.EXTERNAL_API_ERROR,
        message: `TMDB API request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      clearTimeout(timeoutID);
    }
  }

  private async handleErrorResponse(
    response: Response,
    operation: string,
    params: object,
  ): Promise<never> {
    let errorMessage = `TMDB API error during ${operation} with props "${JSON.stringify(
      params,
    )}"`;

    try {
      const errorData = (await response.json()) as TMDBErrorResponse;
      if (errorData.status_message) {
        errorMessage = `${errorMessage}: ${errorData.status_message}`;
      }
    } catch {
      errorMessage = `${errorMessage}: HTTP ${response.status} ${response.statusText}`;
    }

    throw new InfrastructureError({
      code: InfrastructureErrorCode.EXTERNAL_API_ERROR,
      message: errorMessage,
    });
  }

  private mapToMovieSearchResults(
    data: TMDBMovieSearchResultDTO,
  ): MovieSearchResult[] {
    return data.results.map((movie) => {
      const releaseYear = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : 0;

      return {
        externalID: String(movie.id),
        title: movie.title,
        synopsis: movie.overview,
        releaseYear: releaseYear,
        posterPath: movie.poster_path ?? "",
      };
    });
  }

  private mapToExternalMovie(data: TMDBMovieDetailsDTO): ExternalMovie {
    const releaseYear = data.release_date
      ? new Date(data.release_date).getFullYear()
      : 0;

    return {
      externalID: String(data.id),
      title: data.title,
      synopsis: data.overview,
      durationMinutes: data.runtime,
      genres: data.genres.map((genre) => genre.name),
      releaseYear: releaseYear,
      posterPath: data.poster_path ?? "",
    };
  }

  private extractCertification(results: TMDBReleaseDateResultDTO[]): string {
    const priorityCountries = ["ID", "US"];

    for (const countryCode of priorityCountries) {
      const countryResult = results.find((r) => r.iso_3166_1 === countryCode);
      if (countryResult) {
        const certification = this.findTheatricalCertification(
          countryResult.release_dates,
        );
        if (certification) {
          return certification;
        }
      }
    }

    return "";
  }

  private findTheatricalCertification(
    releaseDates: TMDBReleaseDateResultDTO["release_dates"],
  ): string | null {
    const theatricalRelease = releaseDates.find(
      (rd) => rd.type === 3 && rd.certification,
    );
    if (theatricalRelease?.certification) {
      return theatricalRelease.certification;
    }

    const limitedRelease = releaseDates.find(
      (rd) => rd.type === 2 && rd.certification,
    );
    if (limitedRelease?.certification) {
      return limitedRelease.certification;
    }

    const anyWithCert = releaseDates.find((rd) => rd.certification);
    return anyWithCert?.certification ?? null;
  }

  private mapToMovieCertificate(certifcate: string): MovieCertificate | null {
    switch (certifcate) {
      case "SU":
      case "G":
      case "PG":
        return MovieCertificate.SU;
      case "13+":
      case "PG-13":
        return MovieCertificate.R13;
      case "17+":
      case "R":
        return MovieCertificate.D17;
      case "21+":
      case "NC-17":
        return MovieCertificate.D21;
      default:
        return null;
    }
  }

  private async executeWithLogging<T>(
    context: TMDBRequestLogContext,
    apiCall: () => Promise<T>,
  ): Promise<T> {
    const requestId = randomUUID();
    const startTime = Date.now();

    this.logger.log({
      event: "TMDB_REQUEST_START",
      requestId,
      operation: context.operation,
      url: context.url,
      params: context.params,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await apiCall();
      const duration = Date.now() - startTime;

      this.logger.log({
        event: "TMDB_REQUEST_END",
        requestId,
        operation: context.operation,
        statusCode: (result as Response).status,
        statusText: (result as Response).statusText,
        duration: `${duration}ms`,
        success: (result as Response).ok,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error({
        event: "TMDB_REQUEST_ERROR",
        requestId,
        operation: context.operation,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        errorType:
          error instanceof InfrastructureError ? error.code : "UNKNOWN",
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }
}
