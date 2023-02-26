import React from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { CreateDweetModal } from './CreateDweet';
import { DweetModal } from './Dweet';

function ModalSwitch({ children }) {
  const location = useLocation();

  const background = location.state && location.state.background;

  return (
    <>
      <Switch location={background || location}>{children}</Switch>

      {background && (
        <>
          <Route path="/:userId/status/:dweetId">
            <DweetModal />
          </Route>
          <Route path="/compose/dweet">
            <CreateDweetModal />
          </Route>
        </>
      )}
    </>
  );
}

export default ModalSwitch;
