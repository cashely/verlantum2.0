import schema from "async-validator";
import { message } from 'antd'
const validator = function(descriptor) {
  return function(values) {
    return new Promise((resolve) => {
      new schema(descriptor).validate(values, errors => {
        if (errors) {
          errors.map(error => message.error(error.message))
          Promise.reject(errors);
        } else {
          resolve()
        }
      });
    });
  };
};
export { validator }
export default validator
