import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class BuyDto {
  @IsString()
  cryptoId: string;

  @IsNumber()
  @Min(0.00000001)
  quantity: number;

  /** Preço atual obtido do CoinGecko /simple/price pelo app. */
  @IsNumber()
  @Min(0.000001)
  priceAtTransaction: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class SellDto {
  @IsString()
  cryptoId: string;

  @IsNumber()
  @Min(0.00000001)
  quantity: number;

  @IsNumber()
  @Min(0.000001)
  priceAtTransaction: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
