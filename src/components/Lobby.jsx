import React from 'react';
import ReactDOM from 'react-dom';
import './css/lobby.css'
const _ = require('lodash');
export default class Lobby extends React.Component {
    constructor(args) {
        super(...args);

       this.state = {
           errMessage: "",
           gameList:[],
           joinGame:false
       };

       this.handleAddGame = this.handleAddGame.bind(this);
       this.handleRemoveGame = this.handleRemoveGame.bind(this);
       this.handleJoinGame = this.handleJoinGame.bind(this);
       this.handleLoadGameList = this.handleLoadGameList.bind(this);
    }

    handleLoadGameList(){
        return fetch('/Lobby/allGames', {method: 'GET', credentials: 'include'})
            .then((response) => {
                if (!response.ok){
                    throw response;
                }
                this.timeoutId = setTimeout(this.handleLoadGameList, 200);
                return response.json();
            })
            .then(gameList => {
                if (!this.state.joinGame)
                this.setState(()=>({gameList}));
            })
            .catch(err => {throw err});
    }

    componentDidMount(){
        this.handleLoadGameList();
    }
    
    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    removeButton(game){
        if (game.creator===this.props.name && game.loggedInPlayers===0 && game.status==='pending')
            return (  <form onSubmit={this.handleRemoveGame}>
                <input className="submit-btn btn" type="submit" value="remove game" name={game.name}/>
            </form>)
    }

    joinButton(game){
        if (game.numOfPlayers > game.loggedInPlayers && game.status ==='pending')
            return (  <form onSubmit={this.handleJoinGame}>
                <input className="submit-btn btn" type="submit" value="join game" name={game.name}/>
            </form>)
    }

    createGameListItem(game,index){

            return (<li key={game.name + index} className="gameUiBlock">
                <span className={'gameBlock'}>
                    <h3>{`Name: ${game.name}`}</h3>
                    <h3>{`Creator: ${game.creator}`}</h3>
                    <h3>{`Required players: ${game.numOfPlayers}`}</h3>
                    <h3>{`Logged in players: ${game.loggedInPlayers}`}</h3>
                    <h3>{`Status: ${game.status}`}</h3>

                <span>
                {this.joinButton(game)}
                {this.removeButton(game)}
                </span>

                </span>
            </li>)
    }

    render() {
        return (
            <div className="gamesListArea">
                <div className="lobbyAddGameRow">
                    <form    onSubmit={this.handleAddGame} className="addGameForm">
                        <h2>Add new game</h2>
                        <label>
                            Game name:
                            <input className={'space'} type='text' placeholder='game name' name="newGameName"  />
                        </label>
                        <label>
                            Number of players:
                            <select className={'space'} name="numOfPlayers">
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </label>
                        <input className={'addGameButton'} type="submit" value="add game"/>
                    </form>
                    {this.renderErrorMessage()}
                </div>

                <div className="gamesListContainer">
                <h1 className={'marginTop'}>Available Games:</h1>
                    <ul>
                        <div className="gamesListContainerRow">
                        {this.state.gameList.map((game, index) => this.createGameListItem(game,index))}
                        </div>
                        </ul>
                </div>
            </div>
        );
    }

    getChatContent() {
        return fetch('/chat', {method: 'GET', credentials: 'include'})
            .then((response) => {
                if (!response.ok){
                    throw response;
                }
                this.timeoutId = setTimeout(this.getChatContent, 200);
                return response.json();
            })
            .then(content => {
                this.setState(()=>({content}));
            })
            .catch(err => {throw err});
    }

    renderErrorMessage() {
        if (this.state.errMessage) {
            return (
                <div className="add-game-error-message">
                    {this.state.errMessage}
                </div>
            );
        }
        return null;
    }

    handleAddGame(e) {
        e.preventDefault();
        const name = e.target.elements.newGameName.value;
        const numOfPlayers = e.target.elements.numOfPlayers.value;
        const gameObj = {name,numOfPlayers};
        const game = JSON.stringify(gameObj);
        fetch('/Lobby/addGame', {method:'POST', body: game, credentials: 'include'})
            .then(response=> {
                if (response.ok){
                    this.setState(()=> ({errMessage: ""}));
                } else {
                    if (response.status === 403) {
                        this.setState(()=> ({errMessage: "game name already exist, please try another one"}));
                    }
                }
            });
        return false;
    }

    handleJoinGame(e) {
        e.preventDefault();
        const name = e.target.elements[0].name;
        fetch('/Lobby/JoinGame', {method:'POST', body: name, credentials: 'include'})
            .then(response=> {
                if (response.ok){
                    this.setState(()=> ({errMessage: "",joinGame:true}));
                    this.props.joinSuccessHandler(name);
                } else {
                    if (response.status === 403) {
                        this.setState(()=> ({errMessage: "game already deleted"}));
                        this.props.joinErrorHandler();
                    }
                }
            });
        return false;
    }

    handleRemoveGame(e) {
        e.preventDefault();
        const name = e.target.elements[0].name;
        fetch('/Lobby/removeGame', {method:'POST', body: name, credentials: 'include'})
            .then(response=> {
                if (response.ok){
                    this.setState(()=> ({errMessage: ""}));
                } else {
                    if (response.status === 403) {
                        this.setState(()=> ({errMessage: "game already deleted"}));
                    }
                    
                }
            });
        return false;
    }
}