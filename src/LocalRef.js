import cloneDeep  from 'lodash.clonedeep';
import { v4 as uuid } from 'uuid';
import EventEmitter from 'eventemitter3';


class LocalDocument {
  handler = new EventEmitter();

  constructor(id, data={}, options={}) {
    this.id = id;
    this.data = data;
    this.subcollections = {};
    this.options = options;
    this.parent = null;

    if (options.persist) {
      this._load();
      this._save();
    }
  }

  _getSnapshot() {
    return {
      id: this.id,
      data: () => cloneDeep(this.data),
    }
  }

  _emitSnapshot() {
    if (this.options.persist) this._save();
    this.handler.emit('snapshot', this._getSnapshot());
  }

  _pickle() {
    const { data, options } = this;
    const toPickle = { data, options, subcollections: {} };

    for (let name in this.subcollections) {
      toPickle.subcollections[name] = this.subcollections[name]._pickle();
    }

    return JSON.stringify(toPickle);
  }

  _unpickle(pickled) {
    if (!pickled) return;
    const { data, options, subcollections } = JSON.parse(pickled);
    this.options = options;
    for (let name in subcollections) {
      const collection = this.collection(name);
      collection._unpickle(subcollections[name]);
    }

    this.update(data);
  }

  _save() {
    const pickled = this._pickle();
    localStorage.setItem(this.path(), pickled);
  }

  _load() {
    const pickled = localStorage.getItem(this.path());
    this._unpickle(pickled);
  }

  path() {
    const parentPath = this.parent ? this.parent.path() : '';
    return `${parentPath}/${this.id}`
  }

  collection(name) {
    if (!this.subcollections[name]) {
      const newCollection = new LocalCollection(name);
      newCollection.parent = this;
      this.subcollections[name] = newCollection;
    }

    return this.subcollections[name];
  }

  get() {
    return this._getSnapshot();
  }

  onSnapshot(fn) {
    this.handler.on('snapshot', fn);
    this._emitSnapshot();
    return () => {
      this.handler.off('snapshot', fn);
    }
  }

  set(newData) {
    this.data = newData;
    this._emitSnapshot();
    return this;
  }

  update(newData) {
    this.data = {
      ...this.data,
      ...newData
    }

    this._emitSnapshot();
    return this;
  }

  delete() {
    this.handler.emit('delete', this._getSnapshot());
    this.handler.removeAllListeners();
    localStorage.removeItem(this.id);
  }
}


class LocalCollection {
  handler = new EventEmitter();

  constructor(name, options={}) {
    this.name = name;
    this.docs = {};
    this.options = options;
    this.parent = null;

    if (options.persist) {
      this._load();
      this._save();
    }
  }

  _emitSnapshot(changes) {
    if (this.options.persist) this._save();

    this.handler.emit('snapshot', {
      docs: Object.values(this.docs).map(doc => doc._getSnapshot()),
      docChanges: () => changes || [],
    })
  }

  _handleDocAdded = doc => {
    doc.handler.on('snapshot', this._handleDocSnapshot);
    doc.handler.on('delete', this._handleDocDelete);

    this._emitSnapshot([{
      type: 'added',
      doc: doc._getSnapshot(),
    }])
  }

  _handleDocSnapshot = snapshot => {
    this._emitSnapshot([{
      type: 'modified',
      doc: snapshot,
    }]);
  }

  _handleDocDelete = snapshot => {
    delete this.docs[snapshot.id];
    this._emitSnapshot([{
      type: 'deleted',
      doc: snapshot,
    }]);
  }

  _pickle() {
    const { options } = this;
    let toPickle = { options, docs: {} };

    for (let id in this.docs) {
      toPickle.docs[id] = this.docs[id]._pickle();
    }

    return JSON.stringify(toPickle);
  }

  _unpickle(pickled) {
    if (!pickled) return;
    const { options, docs } = JSON.parse(pickled);
    this.options = options;
    for (let id in docs) {
      const doc = this._add(id);
      doc._unpickle(docs[id]);
    }
  }

  _save() {
    const pickled = this._pickle();
    localStorage.setItem(this.path(), pickled);
  }

  _load() {
    const pickled = localStorage.getItem(this.path());
    this._unpickle(pickled);
  }

  _add(id, data={}) {
    const doc = new LocalDocument(id, data);
    doc.parent = this;
    this.docs[id] = doc;

    if (data) {
      this._handleDocAdded(doc);
    } else {
      doc.handler.once('snapshot', () => {
        this._handleDocAdded(doc);
      });
    }

    return doc;
  }

  path() {
    const parentPath = this.parent ? this.parent.path() : '';
    return `${parentPath}/${this.name}`
  }

  add(data) {
    return this._add(uuid(), data);
  }

  doc(id) {
    if (this.docs[id]) {
      return this.docs[id];
    } else {
      return this._add(id);
    }
  }

  where(field, comparison, value) {
    // TODO
    return this;
  }

  onSnapshot(fn) {
    this.handler.on('snapshot', fn);
    this._emitSnapshot(Object.values(this.docs).map(doc => ({
      type: 'added',
      doc: doc._getSnapshot(),
    })));

    return () => {
      this.handler.off('snapshot', fn);
    }
  }
}


export {
  LocalDocument,
  LocalCollection
}
