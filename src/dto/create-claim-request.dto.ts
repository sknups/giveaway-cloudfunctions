import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClaimRequestDto {

  /**
   * The unique identifier of the giveaway.
   */
  @IsString()
  @IsNotEmpty()
  giveaway: string;

  /**
   * The unique identifier of the user performing the claim.
   */
  @IsString()
  @IsNotEmpty()
  user: string;

  /**
   * The claim code.
   */
  @IsString()
  @IsNotEmpty()
  claim: string;

}
