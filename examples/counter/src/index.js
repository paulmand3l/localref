import React from 'react';
import ReactDOM from 'react-dom';
import { LocalDocument } from '@library/LocalRef';
import { withDocument } from '@library/withData';

const counterRef = new LocalDocument('counter', { count: 0 });

const Counter = props => {
  const { count } = props;

  const handleIncrement = () => {
    counterRef.update({ count: count+1 });
  }

  return (
    <div>
      <div>Count: { count }</div>
      <button onClick={handleIncrement}>+1</button>
    </div>
  )
}

const CounterWithRefs = withDocument(Counter, counterRef);

ReactDOM.render(
  <React.StrictMode>
    <CounterWithRefs />
  </React.StrictMode>,
  document.getElementById('root')
);
