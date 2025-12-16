import { Module } from "@nestjs/common";
import { MovieProvider } from "src/domain/ports/movie_provider";
import { TMDBMovieProvider } from "../providers/tmdb_movie_provider";

@Module({
  providers: [
    {
      provide: MovieProvider.name,
      useClass: TMDBMovieProvider,
    },
  ],
  exports: [MovieProvider.name],
})
export class ProviderModule {}
