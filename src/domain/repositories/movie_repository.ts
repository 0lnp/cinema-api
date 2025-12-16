import { Movie } from "../aggregates/movie";
import { MovieID } from "../value_objects/movie_id";

export abstract class MovieRepository {
  public abstract movieOfID(id: MovieID): Promise<Movie | null>;
  public abstract save(movie: Movie): Promise<void>;
  public abstract nextIdentity(): Promise<MovieID>;
}
