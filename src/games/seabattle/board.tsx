import React from 'react';
import PropTypes from 'prop-types';

import { ShipsPlacement } from './ShipsPlacement';
import { IGameArgs } from '../../App/Game/GameBoardWrapper';
import { GameMode } from '../../App/Game/GameModePicker';
import { GameLayout } from '../../App/Game/GameLayout';
import ReactGA from 'react-ga';
import { ISalvo, IShip } from './game';
import { Battle } from './Battle';
import { OptionsMenu } from './OptionsMenu';
import { Radar } from './Radar';
import Typography from '@material-ui/core/Typography';

interface IBoardProps {
  G: any;
  ctx: any;
  moves: any;
  playerID: string;
  isActive: boolean;
  isConnected: boolean;
  gameArgs?: IGameArgs;
  step?: any;
}

interface IBoardState {
  soundEnabled: boolean;
}

export class Board extends React.Component<IBoardProps, IBoardState> {
  constructor(props: IBoardProps, state: IBoardState) {
    super(props, state);
    this.state = {
      soundEnabled: true,
    };
  }

  render() {
    const ctx = this.props.ctx;
    const optionsMenu = <OptionsMenu getSoundPref={this._getSoundPref} setSoundPref={this._setSoundPref} />;
    if (ctx.gameover) {
      const result = (ctx.gameover.winner === this.props.playerID) ?
        'you won' : 'you lost';
      const player = Number(this.props.playerID);
      const otherPlayer = player === 0 ? 1 : 0;
      const salvos: ISalvo[] = this.props.G.salvos.filter(
        (salvo: ISalvo) => salvo.player === player,
      );
      const ships: IShip[] = this.props.G.ships.filter((ship: any) => ship.player === otherPlayer);
      const extraCardContent = (
        <div>
          <Typography variant="title" align="center" style={{ marginTop: '0px', marginBottom: '16px' }}>
            Your Opponent's Board
          </Typography>
          <Radar
            player={player}
            ships={ships}
            salvos={salvos}
            editable={false}
          />
        </div>);
      return (
        <GameLayout gameOver={result} extraCardContent={extraCardContent} gameArgs={this.props.gameArgs} />
      );
    }
    let child;
    if (ctx.phase === 'setup' &&
      (this.props.playerID === null ||
        ctx.actionPlayers.includes(this.props.playerID))) {
      child = (
        <ShipsPlacement
          playerID={this.props.playerID}
          setShips={this._setShips}
        />
      );
    } else if (ctx.phase === 'setup') {
      child = (
        <h1>
          Waiting for opponent...
        </h1>
      );
    } else {
      child = (
        <Battle
          ctx={ctx}
          G={this.props.G}
          moves={this.props.moves}
          playerID={this.props.playerID}
          currentPlayer={ctx.currentPlayer}
          step={this.props.step}
          isAIGame={this.isAIGame()}
          getSoundPref={this._getSoundPref}
        />
      );
    }
    return (
      <GameLayout optionsMenuItems={optionsMenu}>
        {child}
      </GameLayout>
    );
  }

  isAIGame() {
    return (this.props.gameArgs && this.props.gameArgs.mode === GameMode.AI);
  }

  _setSoundPref = (soundEnabled: boolean) => {
    this.setState((oldState) => {
      return { ...oldState, soundEnabled };
    });
  }

  _getSoundPref = () => {
    return this.state.soundEnabled;
  }

  _setShips = (ships: IShip[]) => {
    this.props.moves.setShips(ships);
    if (this.isAIGame()) {
      setTimeout(this.props.step, 250);  // place ships
      setTimeout(this.props.step, 1000);  // make first move
    }
  }
}
