<template>

  <!-- 导航 -->
  <div id="nav">
    <div v-for="(o,idx) in menuData" :key="o.value" :class="route.path==o.value ? 'btn active' : 'btn' " @click="go(idx)">
      {{o.name}}
    </div>
  </div>
 
  <!-- 子应用区域 -->
  <div 
    v-for="o in microApps" 
    v-show="route.path.startsWith(o.prefixPath)"
    :key="o.name" 
    :id="o.container.slice(1)"
  ></div>

  <!-- 主应用区域 -->
  <div style="background:lightgreen">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>

  <div style="margin-top:50px;text-align:left;font-size:12px">
    <div>
      问题1：<br>
      页面打开后默认显示【主应用home】页面，<br>
      先点击【子应用1的home】<br>
      再点击【子应用1的about】，<br>
      再点击【主应用About】，<br>
      再点击【子应用1的about】。<br>
      此时会发现【子应用1的about】页面显示的内容是：【主应用About】页面的内容<br>
    </div>
    <br>
    <div>
      问题2：<br>
      页面打开后，选中【子应用1的home】或其他子页面，<br>
      然后刷新浏览器，<br>
      再点击【主应用Home】或其他主页面，<br>
      测试控制台会有报错：TypeError: parentComponent.ctx.deactivate is not a function<br>
      注意：有时不报错
    </div>
  </div>

</template>

<script>
import {loadMicroApp,initGlobalState, registerMicroApps,start} from 'qiankun'
import {useRoute, useRouter} from 'vue-router'
import { watch,ref, nextTick, onBeforeUnmount, reactive } from 'vue';

import { ElLoading } from 'element-plus';

export default {
  
  setup(){

    const actions = initGlobalState({});

    const route = useRoute()
    const router = useRouter()
    
    //格式：{子应用名1:{app:子应用实例, subRoutes:['子应用路由1','子应用路由2']}, ......}
    const loadedApp = reactive({})  // 已加载的微应用

    const microApps = [
      { 
        name: 'sub1', 
        entry: 'http://localhost:1111', 
        container: '#appChild1',
        prefixPath: '/sub1',
      },
      { 
        name: 'sub2',
        entry: 'http://localhost:2222', 
        container: '#appChild2',
        prefixPath: '/sub2',
      }
    ] 

    const menuData = [
      { name: '★主应用的home★', value: '/' },
      { name: '★主应用的about★', value: '/about' },
      { name: '子应用1的home', value: '/sub1/' },
      { name: '子应用1的about', value: '/sub1/about' },
      { name: '子应用2的home', value: '/sub2/' },
      { name: '子应用2的about', value: '/sub2/about' },
    ]

    const go = (index)=>{
      const routePath = menuData[index].value
      if(route.path != routePath){
        router.push(routePath)
      }
    }

    watch(() => route.path, (nv, ov, onInvalidate) => {
      const routePath = nv

      const microApp = microApps.find(item => routePath.includes(item.prefixPath));

      //如果是子应用
      if(microApp){
        //将主应用的路由转化为子路由URL
        const childRoutePath = routePath.replace(microApp.prefixPath,'');

        //如果没有加载当前子应用
        if(!loadedApp[microApp.name]){

          //开始加载
          let loadingView = ElLoading.service()
          const app = loadMicroApp(microApp); //加载子应用
          //开始完成
          app.loadPromise.then(() => {
            nextTick(() => {
              loadingView.close();
            });
          })
          
          loadedApp[microApp.name] = { //将当前子应用存入loadedApp缓存
            app,
            subRoutes:[childRoutePath]
          }
        }else{//如果已加载子应用,将子应用的路由记录到数组中
          const subRoutes = loadedApp[microApp.name].subRoutes
          if(!subRoutes.includes(childRoutePath)){
            subRoutes.push(childRoutePath)
          }
        }
        
        //通知子应用增加 keep-alive 的 include
        actions.setGlobalState(loadedApp);
      }
    },{ immediate: false })
   
    return {
      route,
      microApps,
      menuData, 
      go,
      loadedApp
    }
  }

}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
  margin-bottom:20px;
   
  .btn {
    font-weight: bold;
    color: #2c3e50;
    cursor: pointer;

    &.active {
      color: #42b983;
    }
  }

  div{
    padding:10px;
    margin-right:10px;
    float:left;
  }
}
</style>
