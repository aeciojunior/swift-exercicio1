import { IsString } from 'class-validator';

export class AddFavoriteDto {
  @IsString()
  cryptoId: string;
}
