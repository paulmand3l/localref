import React from 'react';
import { LocalCollection, withData } from '..';

const itemsRef = LocalCollection('items', { persist: true });

class TodoList extends React.PureComponent {
  state = {
    inputValue: ''
  }

  handleAddTodo = () => {
    itemsRef.add({ name: this.state.inputValue })
    this.setState({ inputValue: '' });
  }

  handleDeleteTodo = item => () => {
    item._ref.delete();
  }

  render() {
    return (
      <div>
        <div>
          <input type="text" value={this.state.inputValue} />
          <button onClick={this.handleAddTodo()}>+</button>
        </div>
        <ol>
          { this.props.items.map(item => (
            <li key={item._id}>
              { item.name }
              <button onClick={this.handleDeleteTodo(item)}>x</button>
            </li>
          )) }
        </ol>
      </div>
    )
  }
}

export default withData(TodoList, {
  items: itemsRef,
});
