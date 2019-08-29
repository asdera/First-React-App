import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return (
      <button className="square" onClick={props.onClick}>
        {props.value}
      </button>
    );
}

class Board extends React.Component {  
    renderSquare(i) {
      return (
        <Square
          value={this.props.squares[i]}
          onClick={() => {this.props.onClick(i)
          }}
        />
      );
    }
  
    render() {
      const winner = calculateWinner(this.props.squares);
      if (winner && winner !== "Draw") {
        return (
          <div className="board">
            <button className="megasquare">
              {winner}
            </button>
          </div>
        );
      } else {
        return (
          <div className={this.props.locked ? "board" : "board unlocked"}>
              <div className="board-row">
                  {this.renderSquare(0)}
                  {this.renderSquare(1)}
                  {this.renderSquare(2)}
              </div>
              <div className="board-row">
                  {this.renderSquare(3)}
                  {this.renderSquare(4)}
                  {this.renderSquare(5)}
              </div>
              <div className="board-row">
                  {this.renderSquare(6)}
                  {this.renderSquare(7)}
                  {this.renderSquare(8)}
              </div>
          </div>
        );
      }
    }
}

class MegaBoard extends React.Component {
    renderBoard(i) {
      // console.log(this.props.boards[i])
      return (
        <Board
          squares={this.props.boards[i]}
          locked={this.props.lock[i] || this.props.free}
          onClick={(j) => {
            this.props.onClick(i, j)
          }}
        />
      );
    }
  
    render() {
        return (
            <div className={this.props.free ? "megaboard unlocked" : "megaboard"}>
                <div className="megaboard-row">
                    {this.renderBoard(0)}
                    {this.renderBoard(1)}
                    {this.renderBoard(2)}
                </div>
                <div className="megaboard-row">
                    {this.renderBoard(3)}
                    {this.renderBoard(4)}
                    {this.renderBoard(5)}
                </div>
                <div className="megaboard-row">
                    {this.renderBoard(6)}
                    {this.renderBoard(7)}
                    {this.renderBoard(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          history: [{
            boards: Array(9).fill(Array(9).fill(null)),
            lock: Array(9).fill(false),
          }],
          stepNumber: 0,
          xIsNext: true,
        };
    }

    handleClick(i, j, step=null) {
        if (step!==null) {
            const history = this.state.history.slice(0, step + 1);
            this.setState({
                history: history,
                stepNumber: step,
            });
            return;
        }
        
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const boards = current.boards.slice();
        const board = boards[i].slice();
        const lock = current.lock.slice();
        const winboard = boards.map(b => calculateWinner(b));


        if (calculateWinner(winboard) || board[j] || winboard[i] || lock[i]) {
          return;
        }

        board[j] = this.state.xIsNext ? 'X' : 'O';
        boards[i] = board;

        lock.forEach((b, i) => {
          lock[i] = true;
        });

        lock[j] = false;

        if ((calculateWinner(board) && i === j) || winboard[j]) {
          lock.forEach((b, i) => {
            lock[i] = false;
          });
        }

        this.setState({
          history: history.concat([{
            boards: boards,
            lock: lock,
          }]),
          stepNumber: history.length,
          xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
        // this.handleClick(0, 0, step);
    }
  
    render() {
        // console.log(this.state.stepNumber)
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const boards = current.boards.slice();
        const lock = current.lock.slice();
        const winboard = boards.map(b => calculateWinner(b));
        const winner = calculateWinner(winboard); // calculateWinner(winboard, true);
        
        const moves = history.map((step, move) => {
            const desc = move ?
              'Go to move #' + move :
              'Go to game start';
            return (
              <li key={move} className={move === this.state.stepNumber ? "highlight" : ""}> 
                <button onClick={() => this.jumpTo(move)}>{desc}</button>
              </li>
            );
        });

        let status;
        if (winner) {
          status = 'Winner: ' + winner;
        } else {
          status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
    
        return (
          <div className="game">
            <div className="game-info">
              <div>{status}</div>
              <ul>{moves}</ul>
            </div>
            <div className="game-board">
              <MegaBoard
                boards={boards}
                lock={lock}
                free={lock.every(x => x===false) || winner}
                onClick={(i, j) => this.handleClick(i, j)}
              />
            </div>
          </div>
        );
    }
}

function calculateWinner(squares, final=false) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && squares[a] !== "Draw") {
        return squares[a];
      }
    }

    return squares.every(x => x) ? (final ? mode(squares) : "Draw") : null;
}

function mode(arr){
  return arr.sort((a,b) =>
        arr.filter(v => v===a).length
      - arr.filter(v => v===b).length
  ).pop();
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
