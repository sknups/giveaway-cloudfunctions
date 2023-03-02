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
   * The claim data required to perform a claim.
   * 
   * - For a v1 giveaway this will be a lucu
   * - For a v2 giveaway this will be a claim code
   */
  @IsString()
  @IsNotEmpty()
  claim: string;

}
