import React, {Component} from 'react';
import {Modal, Form, Icon, Input, Button, Timeline} from 'antd';
import {sortable} from 'react-sortable';
import {SortableContainer, SortableElement, sortableHandle} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import $ from '../ajax';
import _ from 'lodash';
export default class Node extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        nodes: [
          {
            title: '开始',
            type: '0'
          }
        ]
      }
    }
  }
  onAddAction() {
    let data = this.state.data;
    data.nodes.push({
      title: '',
      type: 0
    })
    this.setState({
      data
    })
  }
  nodeDetailAction() {
    $.get(`/node/${this.props.cid}`).then(res => {
      if(res.code === 0 && res.data) {
        this.setState({
          data: res.data
        })
      }
    })
  }
  onChangeAction(index, e) {
    // console.log(e.)
    // return;
    let data = this.state.data;
    data.nodes[index].title = e.currentTarget.value;
    // console.log(e.currentTarget.value)
    this.setState({
      data
    })
  }

  onOk() {
    console.log(this.state.data);
    this.props.onOk(this.state.data);
  }
  onSortEnd = ({oldIndex, newIndex}) => {
    let data = this.state.data;
    data.nodes = arrayMove(data.nodes, oldIndex, newIndex);
    this.setState({
      data
    });
  }
  componentWillMount() {
    this.props.cid && this.nodeDetailAction();
  }
  render() {
    const {Item} = Form;
    return (
      <Modal
        title="添加用例节点"
        visible={this.props.visible}
        onOk={this.onOk.bind(this)}
        onCancel={this.props.onCancel}
        >

        <Form>
          <Item>
            <Button type="dashed" onClick={this.onAddAction.bind(this)} style={{ width: '100px' }}>
              <Icon type="plus" /> 添加节点
            </Button>
          </Item>
          <SortableList onChangeAction={this.onChangeAction.bind(this)} items={this.state.data.nodes} onSortEnd={this.onSortEnd} />
        </Form>
      </Modal>
    )
  }
}


const SortableItem = SortableElement(props => {
  return (
    <Timeline.Item key={props.index} className={props.className} style={{zIndex: 3000, cursor: 'move'}}>
      <Input onChange={(v) => {props.onChangeAction(props.index, v)} } placeholder="Basic usage" value={props.title} />
    </Timeline.Item>
  )
})

const SortableList = SortableContainer(({items, onChangeAction}) => {
  return (
    <Timeline>
      {items.map((item, index) => (
        <SortableItem
          key={index}
          hideSortableGhost={false}
          index={index}
          title={item.title}
          className={item.length === index+1 ? 'ant-timeline-item-last' : null}
          onChangeAction={onChangeAction}
        />
      ))}
    </Timeline>
  );
});

const DragHandle = sortableHandle(() => <span>::</span>);
