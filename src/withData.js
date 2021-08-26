import React from 'react'


export const withCollection = (WrappedComponent, collectionRef, propName) => {
  propName = propName || collectionRef.path;

  return class extends React.PureComponent {
    state = {
      itemList: [],
      itemMap: {},
    }

    componentDidMount() {
      this.unsubscribe = collectionRef.onSnapshot(snapshot => {
        const changed = {};

        snapshot.docChanges().forEach(change => {
          changed[change.doc.id] = true;
        });

        const itemMap = {};
        const itemList = snapshot.docs.map(doc => {
          const item = changed[doc.id] ?
            { _id: doc.id, _ref: collectionRef.doc(doc.id), ...doc.data() } : this.state.itemMap[doc.id];
          itemMap[item._id] = item;
          return item;
        });

        if (this.preventStateUpdates) return;
        this.setState({ itemList, itemMap });
      });
    }

    componentWillUnmount() {
      this.preventStateUpdates = true;
      this.unsubscribe();
    }

    render() {
      const props = {
        [propName]: this.state.itemList,
        [propName+'Ref']: collectionRef,
      }

      return <WrappedComponent {...props} {...this.props} />
    }
  }
}

export const withDocument = (WrappedComponent, documentRef, propName) => {
  return class extends React.PureComponent {
    state = {
      data: {},
    }

    componentDidMount() {
      this.unsubscribe = documentRef.onSnapshot(snapshot => {
        if (this.preventStateUpdates) return;
        this.setState({ data: snapshot.data() });
      })
    }

    componentWillUnmount() {
      this.preventStateUpdates = true;
      this.unsubscribe();
    }

    render() {
      const props = propName ? {
        [propName]: this.state.data,
        [propName+'Ref']: documentRef,
      } : {
        ...this.state.data,
        documentRef
      };

      return <WrappedComponent key={documentRef.id} {...props} {...this.props} />
    }
  }
}

export const withRefs = (WrappedComponent, refs) => {
  for (let propName in refs) {
    const ref = refs[propName];
    const withRef = ref.where ? withCollection : withDocument;
    WrappedComponent = withRef(WrappedComponent, ref, propName)
  }

  return WrappedComponent
}
