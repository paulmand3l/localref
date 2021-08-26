# Introduction

localref is designed to be a very simple, fast way to manage state in web applications.

localref is based loosely on the data-flow philosophy (and API) of Firebase's FireStore. You create instances of either `LocalDocument` or `LocalCollection`, call various methods on those instances to update their data (e.g. `set`, `update`, `add`, `delete`), and then call either `get()` to get the data once or `onSnapshot(...)` to listen for every change to the document.

localref also provides several convenience wrappers to interact with React components (sorry, no hooks yet). `withDocument` and `withCollection` automates listening to onSnapshot for single documents or collections, and the more flexible and generic `withRefs` listens to several refs.

# Installation

`npm install localref`
`yarn add localref`

# Usage

Here's an example of using localrefs to implement a simple counter.

```
import React from 'react';
import { LocalDocument, withDocument } from 'localref';

// Create a new documentRef called 'counter' with initial data { count: 0 }
const counterRef = new LocalDocument('counter', { count: 0 });

const Counter = props => {
  const { count } = props;

  const handleIncrement = () => {
    // To update the count, we just call the update method
    // on the counterRef we made earlier.
    counterRef.update({ count: count+1 });
  }

  return (
    <div>
      <div>Count: { count }</div>
      <button onClick={handleIncrement}>+1</button>
    </div>
  )
}

// withDocument destructures counterRef's data into the props of Counter
// It's kind of like doing this <Counter {...counterData}>
// But the props change and the component re-renders whenever the data
// in counterRef changes anywhere in your application.
export default withDocument(Counter, counterRef);
```

Here's a slightly more complex example of using localrefs to implement a simple todo list

```
import React from 'react';
import { LocalCollection, withRefs } from 'localref';

// Create a new localcollection to store the items
const itemsRef = new LocalCollection('items');

// This component handles inputting new todos
class TodoInput extends React.PureComponent {
  inputRef = React.createRef()

  handleAdd = e => {
    e.preventDefault();

    if (!this.inputRef.current.value) return;

    // Add this data as a new LocalDocument to our LocalCollection
    itemsRef.add({
      name: this.inputRef.current.value,
      checked: false
    })

    this.inputRef.current.value = '';
    this.inputRef.current.focus();
  }

  render() {
    return (
      <form onSubmit={this.handleAdd}>
        <input ref={this.inputRef} type="text" />
        <button type="submit">+</button>
      </form>
    )
  }
}

// This component handles rendering a single item on the todo list
// As well as checking off that item and deleting it.
const Item = props => {
  const handleCheck = () => {
    // The original ref is available on the item via the _ref attribute
    // We could also update the item via itemsRef.doc(props._id).update(...)
    props._ref.update({ checked: !props.checked })
  }

  const handleDelete = () => {
    // Deleting the ref also removes it from the LocalCollection it's in
    props._ref.delete();
  }

  return (
    <div onClick={handleCheck}>
      <input type="checkbox" checked={props.checked}></input>
      { props.name }
      { props.checked ? (
        <button onClick={handleDelete}>x</button>
      ) : null }
    </div>
  )
}

// This component renders the full list
const TodoList = props => {
  return (
    <div>
      <TodoInput />
      { props.items.map(item => (
        // Because we added this todo to our LocalCollection using the
        // .add() method, item._id is a randomly generated uuid
        <Item key={item._id} {...item}/>
      )) }
    </div>
  )
}

export default TodoListWithRefs = withRefs(TodoList, {
  items: itemsRef,
});
