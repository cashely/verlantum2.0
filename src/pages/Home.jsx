import React, { Component } from 'react';
import { DatePicker, Layout, Card, Row, Col, Pagination, Statistic, Table, Tag, Progress, Button, Icon, Upload, notification } from 'antd';
import $ from '../ajax';
import m from 'moment';
import _ from 'lodash';
import GroupModal from '../components/GroupModal';
import PieChart from '../components/PieChart';
import LineChart from '../components/LineChart';
import ExportModal from '../components/models/ExportModal';

export default class Home extends Component {
  render() {
    const {Content} = Layout;
    return (
      <Layout style={{height: '100%'}}>
        <Content>
          <Layout>
            <Content>
                
            </Content>
          </Layout>
        </Content>
      </Layout>
    )
  }
}
