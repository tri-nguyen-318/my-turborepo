import { Module } from '@nestjs/common';
import { TicTacToeGateway } from './application/tictactoe.gateway';
import { TicTacToeService } from './application/tictactoe.service';
import { TicTacToeController } from './presentation/tictactoe.controller';

@Module({
  controllers: [TicTacToeController],
  providers: [TicTacToeGateway, TicTacToeService],
})
export class TicTacToeModule {}
