import React, {Component} from 'react';
import {Form, Input, Button, Icon, Radio, Modal, Select, message} from 'antd';
import $ from '../../ajax';
export default class FruitModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }
  componentWillMount() {
  }
  render() {
    return (
      <Modal
        title="二维码查看"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
      >
          
        </Form>
      </Modal>
    )
  }
}
