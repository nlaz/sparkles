import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import cookie from "js-cookie";

import * as api from "../apiActions";
import DeckItem from "../home/DeckItem";
import SkillProgress from "../home/SkillProgress";
import isAuthenticated from "../utils/isAuthenticated";
import Octicon from "../../components/Octicon";
import * as analytics from "../../components/GoogleAnalytics";

class MyDecksHome extends Component {
  state = { decks: [], pinnedDecks: [], studyProgress: [], isRedirect: false };

  componentDidMount() {
    const { userId } = this.props.match.params;
    const user = isAuthenticated() ? JSON.parse(cookie.get("user")) : {};
    if (user && user.id !== userId) {
      this.setState({ isRedirect: true });
    } else {
      this.fetchDecksForUser(userId);
      this.fetchStudyProgress();
      this.fetchPinnedDecks();
    }
  }

  fetchDecksForUser = () => {
    api
      .fetchDecksForUser()
      .then(response => this.setState({ decks: response.data }))
      .catch(error => console.error(error));
  };

  fetchStudyProgress = () => {
    api
      .fetchStudyProgress()
      .then(response => this.setState({ studyProgress: response.data }))
      .catch(error => console.error(error));
  };

  fetchPinnedDecks = () => {
    api
      .fetchPinnedDecks()
      .then(({ data }) => this.setState({ pinnedDecks: data }))
      .catch(error => console.error(error));
  };

  onTogglePin = (event, deck) => {
    event.preventDefault();
    const isPinned = this.isPinned(deck.id);
    analytics.logPinDeckAction(deck.name, isPinned);

    api
      .togglePinnedDeck(deck.id, isPinned)
      .then(response => this.setState({ pinnedDecks: response.data }))
      .catch(error => console.error(error));
  };

  isPinned = id => this.state.pinnedDecks.find(el => el.id === id);
  getDeckProgress = id => this.state.studyProgress.find(el => el.deck === id);

  render() {
    const { decks, isRedirect } = this.state;

    if (isRedirect) {
      return <Redirect to="/" />;
    }

    return (
      <div>
        <div
          className="collection-header py-4"
          style={{ background: "#f9f9f9", borderBottom: "1px solid #e8e8e8" }}
        >
          <div className="container container--full px-4 my-2">
            <div className="d-flex flex-column-reverse flex-lg-row justify-content-between align-items-lg-center">
              <div className="m-2">
                <h1 className="m-0">My Decks</h1>
                <p className="m-0">A collection of flashcard decks created by you.</p>
                <Link to="/decks/new" className="btn btn-success btn-sm text-white mt-1">
                  + Add Deck
                </Link>
              </div>
              <div
                className="bg-light rounded px-3 py-2 mb-2 border border-secondary d-flex align-items-center"
                style={{ minWidth: "260px", minHeight: "90px" }}
              >
                <SkillProgress decks={decks} studyProgress={this.state.studyProgress} />
              </div>
            </div>
          </div>
        </div>

        <div className="container container--full px-4 my-5">
          <div className="d-flex align-items-center justify-content-between mb-2" />
          {decks.length > 0 ? (
            <div className="row">
              {decks.map(item => (
                <DeckItem
                  key={item.id}
                  deck={item}
                  isPinned={this.isPinned(item.id)}
                  deckProgress={this.getDeckProgress(item.id)}
                  onTogglePin={this.onTogglePin}
                />
              ))}
            </div>
          ) : (
            <div className="blankslate py-5 my-2">
              <Octicon name="note" height="32" fill="#99a0a8" className="mx-2" />
              <Octicon name="package" height="32" fill="#99a0a8" className="mx-2" />
              <Octicon name="graph" height="32" fill="#99a0a8" className="mx-2" />

              <h1 className="m-0">No current decks</h1>
              <p>You don't have any flashcard decks yet. Add a few decks to get started.</p>
              <Link to="/decks/new" className="btn btn-success btn-sm text-white px-3">
                + Add Deck
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default MyDecksHome;
