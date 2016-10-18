'use strict';

var Board = React.createClass({
  displayName: 'Board',

  getInitialState: function getInitialState() {
    return {
      rows: 30,
      cols: 60,
      boardVals: [],
      generation: 1,
      running: true,
      clear: false,
      interval: 100 //new generation every 100 milliseconds
    };
  },

  //each square has a 25% chance of being alive initially
  randomBinary: function randomBinary() {
    return Math.floor(Math.random() * (100 / 15.)) == 0 ? 1 : 0;
  },

  //checks whether a square will live to see the next generation
  squareCheck: function squareCheck(row, col) {
    var totalRows = this.state.rows,
        totalCols = this.state.cols,
        board = this.state.boardVals,

    //these variables ensure that the check will work
    //even for squares on the edge of the board
    colLeft = (col - 1 + totalCols) % totalCols,
        colRight = (col + 1) % totalCols,
        rowTop = (row - 1 + totalRows) % totalRows,
        rowBot = (row + 1) % totalRows,
        neighborCount = 0;

    if (board[rowTop][colLeft] == 1) neighborCount++;
    if (board[rowTop][col] == 1) neighborCount++;
    if (board[rowTop][colRight] == 1) neighborCount++;
    if (board[row][colLeft] == 1) neighborCount++;
    if (board[row][colRight] == 1) neighborCount++;
    if (board[rowBot][colLeft] == 1) neighborCount++;
    if (board[rowBot][col] == 1) neighborCount++;
    if (board[rowBot][colRight] == 1) neighborCount++;

    var val = board[row][col];
    if (val == 1) {
      if (neighborCount == 2 || neighborCount == 3) return 1;else return 0;
    } else {
      if (neighborCount == 3) return 1;else return 0;
    }
  },

  //initially randomly populates the board
  initBoard: function initBoard() {
    var initboard = [];
    for (var i = 0; i < this.state.rows; i++) {
      var thisrow = [];
      for (var j = 0; j < this.state.cols; j++) {
        thisrow.push(this.randomBinary());
      }
      initboard.push(thisrow);
    }
    this.setState({ boardVals: initboard });
  },

  //creates a new generation based on the old
  nextGen: function nextGen() {
    if (this.state.running) {
      var newboard = [];
      for (var i = 0; i < this.state.rows; i++) {
        var thisrow = [];
        for (var j = 0; j < this.state.cols; j++) {
          thisrow.push(this.squareCheck(i, j));
        }
        newboard.push(thisrow);
      };

      this.setState({ boardVals: newboard });
      this.setState({ generation: this.state.generation + 1 });
    }
  },

  //we start the board off
  componentWillMount: function componentWillMount() {
    this.initBoard();
  },

  //calls for a new generation every interval (e.g. 100 milliseconds)
  componentDidMount: function componentDidMount() {
    setInterval(function () {
      this.nextGen();
    }.bind(this), this.state.interval);
  },

  //pauses/continues the passage of time
  togglePlay: function togglePlay() {
    this.state.running ? this.setState({ running: false }) : this.setState({ running: true }, this.nextGen());
  },

  //clears/randomly repopulates the board
  toggleClear: function toggleClear() {
    if (!this.state.clear) {
      var clearboard = [];
      for (var i = 0; i < this.state.rows; i++) {
        var thisrow = [];
        for (var j = 0; j < this.state.cols; j++) {
          thisrow.push(0);
        }
        clearboard.push(thisrow);
      }
      this.setState({ running: false });
      this.setState({ boardVals: clearboard });
      this.setState({ clear: true });
      this.setState({ generation: 0 });
    } else {
      this.setState({ clear: false }, this.setState({ running: true }, function () {
        this.initBoard();
      }.bind(this)));
    }
  },

  //gives life or death to the selected square
  clickSquare: function clickSquare(row, col) {
    var newboard = this.state.boardVals;
    newboard[row][col] = !newboard[row][col];
    this.setState({ boardVals: newboard });
  },

  render: function render() {
    return React.createElement(
      'div',
      null,
      React.createElement(ControlPanel, { running: this.state.running, clear: this.state.clear, toggleClear: this.toggleClear, togglePlay: this.togglePlay, generation: this.state.generation }),
      React.createElement(DrawBoard, { boardVals: this.state.boardVals, totalcols: this.state.cols, clickSquare: this.clickSquare })
    );
  }
});

//draws the top stuff--title, reset button, pause button, generation count
var ControlPanel = React.createClass({
  displayName: 'ControlPanel',

  render: function render() {
    return React.createElement(
      'div',
      { className: 'control-panel' },
      React.createElement(
        'h1',
        { className: 'title' },
        'Conway\'s Game of Life'
      ),
      React.createElement(
        'div',
        { className: 'btn clear-btn', onClick: this.props.toggleClear },
        React.createElement('i', { className: this.props.clear ? 'fa fa-random' : 'fa fa-trash-o' })
      ),
      React.createElement(
        'div',
        { className: 'btn pause-btn', onClick: this.props.togglePlay },
        React.createElement('i', { className: this.props.running ? 'fa fa-pause' : 'fa fa-play' })
      ),
      React.createElement(
        'div',
        { className: 'gen-display' },
        'Generation ',
        React.createElement(
          'strong',
          null,
          this.props.generation
        )
      )
    );
  }
});

var Square = React.createClass({
  displayName: 'Square',

  //clicking a square will bestow/take away its life
  handleClick: function handleClick() {
    this.props.clickSquare(this.props.row, this.props.col);
  },

  render: function render() {
    var squareSide = 1000 / this.props.totalcols;
    var divStyle = { width: squareSide, height: squareSide };
    return React.createElement('div', { className: 'square ' + (this.props.alive ? 'alive' : 'dead'), style: divStyle, onClick: this.handleClick });
  }
});

//draws the board
var DrawBoard = React.createClass({
  displayName: 'DrawBoard',

  render: function render() {
    var totalcols = this.props.totalcols;
    var clickSquare = this.props.clickSquare;
    var squares = this.props.boardVals.map(function (thisrow, rowindex) {
      return thisrow.map(function (thiscol, colindex) {
        return React.createElement(Square, { totalcols: totalcols, alive: thiscol == 1 ? true : false, clickSquare: clickSquare, row: rowindex, col: colindex });
      });
    });

    return React.createElement(
      'div',
      { className: 'board' },
      squares
    );
  }
});

ReactDOM.render(React.createElement(Board, null), document.getElementById('app'));