import { IsIn, IsNumber, IsString, Min } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  cryptoId: string;

  @IsIn(['above', 'below'])
  alertType: 'above' | 'below';

  @IsNumber()
  @Min(0.000001)
  targetPrice: number;
}
