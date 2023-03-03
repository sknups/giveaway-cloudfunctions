import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { GiveawayType } from './giveaway-type.dto';


export class SaveGiveawayRequestDto {

  @IsString()
  @IsNotEmpty()
  public readonly title: string;

  @IsEnum(GiveawayType)
  @IsNotEmpty()
  public readonly type: GiveawayType;

  @IsString()
  @IsNotEmpty()
  public readonly description: string;

  @IsString()
  @IsNotEmpty()
  public readonly config: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public readonly publicKey?: string;

  @IsString()
  @IsNotEmpty()
  @ValidateIf(o => o.secret !== undefined || !o.publicKey)
  public readonly secret?: string;
}
