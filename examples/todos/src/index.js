import React from 'react';
import ReactDOM from 'react-dom';
import { LocalCollection } from '@library/LocalRef';
import { withRefs } from '@library/withData';

const itemsRef = new LocalCollection('items');

class TodoInput extends React.PureComponent {
  inputRef = React.createRef()

  handleAdd = e => {
    e.preventDefault();

    if (!this.inputRef.current.value) return;
    itemsRef.add({ name: this.inputRef.current.value, checked: false })

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

const Item = props => {
  const handleCheck = () => {
    props._ref.update({ checked: !props.checked })
  }

  const handleDelete = () => {
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

const TodoList = props => {
  return (
    <div>
      <TodoInput />
      { props.items.map(item => (
        <Item key={item._id} {...item}/>
      )) }
    </div>
  )
}

const TodoListWithRefs = withRefs(TodoList, {
  items: itemsRef,
});

ReactDOM.render(
  <React.StrictMode>
    <TodoListWithRefs />
  </React.StrictMode>,
  document.getElementById('root')
);
