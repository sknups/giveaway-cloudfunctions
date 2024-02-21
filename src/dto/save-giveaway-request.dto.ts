import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
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
  public readonly secret: string;

}
