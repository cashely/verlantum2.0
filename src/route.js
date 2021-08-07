import loadable from '@loadable/component';

export const Login = loadable(() => import('./pages/Login'))
export const Home = loadable(() => import('./pages/Home'))
export const Add = loadable(() => import('./pages/Add'))
export const DetailList = loadable(() => import('./pages/DetailList'));
export const Good = loadable(() => import('./pages/Good'));
export const User = loadable(() => import('./pages/User'));
export const Outer = loadable(() => import('./pages/Outer'));
export const Inner = loadable(() => import('./pages/Inner'));
export const Pushers = loadable(() => import('./pages/Pushers'));
export const Pullers = loadable(() => import('./pages/Pullers'));
export const Fruits = loadable(() => import('./pages/Fruits'));
export const Arg = loadable(() => import('./pages/Arg'));
export const Apis = loadable(() => import('./pages/Apis'));
export const Auth = loadable(() => import('./pages/Auth'));
export const Activity = loadable(() => import('./pages/Activity'))
export const GoodCheck = loadable(() => import('./pages/good/Check'))
export const GoodCreate = loadable(() => import('./pages/good/Create'))
export default {}
