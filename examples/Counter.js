import React from "react";
import { LocalDocument, withData } from "..";

const counterRef = new LocalDocument('counter', { count: 0 });

const Counter = props => {
  const { count } = props.counter;

  const handleIncrement = () => {
    counterRef.update({ count: count+1 });
  }

  return (
    <div>
      { count }
      <button onClick={handleIncrement}>
        Increment
      </button>
    </div>
  )
}

export default withData(Counter, {
  counter: counterRef,
});
