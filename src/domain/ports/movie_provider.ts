export interface MovieSearchResult {
  externalID: string;
  title: string;
  synopsis: string;
  releaseYear: number;
  posterPath: string;
}

export interface ExternalMovie extends MovieSearchResult {
  durationMinutes: number;
  genres: string[];
}

export abstract class MovieProvider {
  public abstract searchMovie(keyword: string): Promise<{
    results: MovieSearchResult[];
    resultCount: number;
  }>;
  public abstract movieOfID(externalID: string): Promise<ExternalMovie | null>;
  public abstract certificate(externalID: string): Promise<string | null>;
}
