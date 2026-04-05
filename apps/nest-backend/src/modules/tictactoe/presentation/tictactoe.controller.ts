import { Controller, Post, Body } from '@nestjs/common';
import { IsArray, IsIn, IsNotEmpty } from 'class-validator';
import { TicTacToeService } from '../application/tictactoe.service';

type Cell = 'X' | 'O' | null;
type Mark = 'X' | 'O';

class GetMoveDto {
  @IsArray() board: Cell[];
  @IsNotEmpty() @IsIn(['X', 'O']) mark: Mark;
}

@Controller('tictactoe')
export class TicTacToeController {
  constructor(private readonly service: TicTacToeService) {}

  @Post('move')
  async getMove(@Body() body: GetMoveDto) {
    const move = await this.service.getBestMove(body.board, body.mark);
    return { move };
  }
}
