import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/about",
    name: "About",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// const childRoute = ['/sub1','/sub2'];
// const isChildRoute = path => childRoute.some(item => path.startsWith(item))
// // const rawAppendChild = HTMLHeadElement.prototype.appendChild;
// // const rawAddEventListener = window.addEventListener;
// router.beforeEach((to, from, next) => {
//   // 从子项目跳转到主项目
//   // if(isChildRoute(from.path) && !isChildRoute(to.path)){
//   //   HTMLHeadElement.prototype.appendChild = rawAppendChild;
//   //   window.addEventListener = rawAddEventListener;
//   // }
//   console.log(">>>>MMMMMMMMMMMMMM<<<<",isChildRoute(to.path),to.path)
//   next();
// });

export default router;
