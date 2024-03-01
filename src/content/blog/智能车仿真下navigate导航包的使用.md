---
title: "智能车仿真下Navigate导航包的使用"
pubDatetime: 2022-05-21
categories:
  - "智能科学"
  - "算法"
tags:
  - "dwa算法"
  - "teb算法"
  - "智能车"
description: "智能车是否能正确地快速地找到路径和 move_base package 离不开关系，这篇文章主要归纳了智能车仿真赛的最核心部分，move_base 参数及含义归纳，包含dwa和teb"
---

智能车是否能正确地快速地找到路径和 move_base package 离不开关系，这篇文章主要归纳了智能车仿真赛的最核心部分，move_base 参数及含义归纳，包含dwa和teb

---

### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#%E5%8D%9A%E6%96%87%E9%93%BE%E6%8E%A5)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#%E5%8D%9A%E6%96%87%E9%93%BE%E6%8E%A5)博文链接

创客智造Navigation系列教程：[https://www.ncnynl.com/archives/201708/1880.html](https://www.ncnynl.com/archives/201708/1880.html)

_创客智造里面的博文挺老的了可能会有错误，但总体还是挺好的，有比较全的Navigation教程_

ROS Navigation github源码包：[https://github.com/ros-planning/navigation](https://github.com/ros-planning/navigation)

move_base：

- ROS Wiki：[http://wiki.ros.org/move_base](http://wiki.ros.org/move_base)
- 古月居：[https://www.guyuehome.com/270](https://www.guyuehome.com/270)
- CSDN：[https://blog.csdn.net/heyijia0327/article/details/41823809](https://blog.csdn.net/heyijia0327/article/details/41823809)

TEB local planner：

- ROS Wiki：[http://wiki.ros.org/teb_local_planner](http://wiki.ros.org/teb_local_planner)
- TEB参数调整 *1*：[https://blog.csdn.net/Fourier_Legend/article/details/89398485](https://blog.csdn.net/Fourier_Legend/article/details/89398485)
- TEB参数调整 *2*：[https://www.knightdusk.cn/2019/06/features-and-tuning-guide-for-teb-local-planner/](https://www.knightdusk.cn/2019/06/features-and-tuning-guide-for-teb-local-planner/)

DWA local planner:

- ROS Wiki：[http://wiki.ros.org/dwa_local_planner](http://wiki.ros.org/dwa_local_planner)
- DWA参数调整：[https://www.ncnynl.com/archives/201708/1906.html](https://www.ncnynl.com/archives/201708/1906.html)_DWA相较于TEB而言参数比较少，含义也很清晰，网上的资源会比较少一些_

其他局部路径规划算法：

- 古月居：[https://www.guyuehome.com/5500](https://www.guyuehome.com/5500)

### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#%E7%AE%80%E5%8D%95%E9%98%90%E8%BF%B0)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#%E7%AE%80%E5%8D%95%E9%98%90%E8%BF%B0)简单阐述

[![image-20200804225115898](/assets/images/Q6ufzjZVtwkYIT7.png)](https://i.loli.net/2020/08/04/Q6ufzjZVtwkYIT7.png)

在总体框架图中可以看到，move_base提供了ROS导航的配置、运行、交互接口，它主要包括四个部分：

（1）全局路径规划（global planner）：根据给定的目标位置进行总体路径的规划；

（2）本地实时规划（local planner）：根据附近的障碍物进行躲避路线规划。

（3）全局代价地图（global costmap）：用于在全局地图中将laser扫面数据或者点云数据转化成一个2d的网格地图

（4）局部代价地图（local costmap）：用于在局部地图中将laser扫面数据或者点云数据转化成一个2d的网格地图

上图中位于导航功能正中心的蓝色方框是`move_base`节点，可以理解为一个强大的路径规划器，在实际的导航任务中，你只需要启动这一个node，并且给它提供数据，就可以规划出路径和速度。 `move_base`之所以能做到路径规划，是因为它包含了很多的插件，像图中的圆圈`global_planner`、`local_planner`、`global_costmap`、`local_costmap`、`recovery_behaviors`。这些插件用于负责一些更细微的任务：全局路径规划、局部路径规划、全局代价地图、局部代价地图、恢复行为。而每一个插件其实也都是一个package，放在Navigation Stack里。

### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6)配置文件

以下配置文件仅针对博主提供的racecar源码包

#### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#move-base%E5%90%AF%E5%8A%A8%E6%96%87%E4%BB%B6)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#move-base%E5%90%AF%E5%8A%A8%E6%96%87%E4%BB%B6)move_base启动文件

- racecar_runway_navigation.launch 启动move_base节点的launch文件

```xml
<!--Launch the move base with time elastic band-->
<param name="/use_sim_time" value="true"/>
<node pkg="move_base" type="move_base" respawn="false" name="move_base" output="screen">
  <rosparam file="$(find racecar_gazebo)/config/costmap_common_params.yaml" command="load" ns="global_costmap" />
  <rosparam file="$(find racecar_gazebo)/config/costmap_common_params.yaml" command="load" ns="local_costmap" />
  <rosparam file="$(find racecar_gazebo)/config/local_costmap_params.yaml" command="load" />
  <rosparam file="$(find racecar_gazebo)/config/global_costmap_params.yaml" command="load" />
  <rosparam file="$(find racecar_gazebo)/config/global_planner_params.yaml" command="load" />
  <rosparam file="$(find racecar_gazebo)/config/teb_local_planner_params.yaml" command="load" />
  <!--<rosparam file="$(find racecar_gazebo)/config/dwa_local_planner_params.yaml" command="load" />-->

  <param name="base_global_planner" value="global_planner/GlobalPlanner" />
  <param name="planner_frequency" value="3.0" />
  <param name="planner_patience" value="6.0" />
  <!--param name="use_dijkstra" value="false" /-->

  <param name="base_local_planner" value="teb_local_planner/TebLocalPlannerROS" />
  <!--<param name="base_local_planner" value="dwa_local_planner/DWAPlannerROS" /> -->
  <param name="controller_frequency" value="10.0" />
  <!-- 5.0 15.0 -->
  <param name="controller_patience" value="15.0" />

  <param name="clearing_rotation_allowed" value="false" />
</node>
```

- 从上面可以看到，在启动move_base节点时，前四个参数是配置代价地图相关参数，首先加载了costmap_common_params.yaml到global_costmap和local_costmap两个命名空间中，因为该配置文件是一个通用的代价地图配置参数，即local_costmap和global_costmap都需要配置的参数。然后下面的local_costmap_params.yaml是专门为了局部代价地图配置的参数，global_costmap_params.yaml是专门为全局代价地图配置的参数。而后面三个是配置路径规划相关参数。

#### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#%E4%BB%A3%E4%BB%B7%E5%9C%B0%E5%9B%BE%E9%85%8D%E7%BD%AE)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#%E4%BB%A3%E4%BB%B7%E5%9C%B0%E5%9B%BE%E9%85%8D%E7%BD%AE)代价地图配置

- costmap_common_params.yaml 代价地图通用配置文件

```yml
footprint: [[0.27, 0.23], [0.27, -0.23], [-0.27, -0.23], [-0.27, 0.23]]

transform_tolerance: 0.2
map_type: costmap

obstacle_layer:
  enabled: true
  obstacle_range: 3.0
  raytrace_range: 3.5
  inflation_radius: 0.2
  track_unknown_space: false
  combination_method: 1

  observation_sources: laser_scan_sensor
  laser_scan_sensor:
    {
      data_type: LaserScan,
      topic: scan,
      marking: true,
      clearing: true,
      truemin_obstacle_height: -1,
      max_obstacle_height: 1,
    }

inflation_layer:
  enabled: true
  cost_scaling_factor: 10.0 # exponential rate at which the obstacle cost drops off (default: 10)
  inflation_radius: 0.45 # max. distance from an obstacle at which costs are incurred for planning paths.

static_layer:
  enabled: true
  map_topic: "/map"
```

- 下面来依次解释下各参数的意义：
  - **footprint**：每一个坐标代表机器人上的一点，设置机器人的中心为\[0,0\]，根据机器人不同的形状，找到机器人各凸出的坐标点即可，具体可参考下图来设置(如果是圆形底盘机器人，直接设置半径大小即可：例如 **robot_radius: 0.5**)：[](https://s2.ax1x.com/2019/06/01/V3CLrT.png)
  - **map_type**: 地图类型，这里为`costmap`(代价地图)。另一种地图类型为为`voxel`(体素地图)。这两者之间的区别是前者是世界的2D表示，后者为世界的3D表示。
  - **obstacle_layer**：配置障碍物图层
    - _enabled_: 是否启用该层
    - _combination_method(default: 1)_: 只能设置为0或1，用来更新地图上的代价值，一般设置为1;
    - _track_unknown_space (default: false)_: 如果设置为false，那么地图上代价值就只分为致命碰撞和自由区域两种，如果设置为true，那么就分为致命碰撞，自由区域和未知区域三种。意思是说假如该参数设置为false的话，就意味着地图上的未知区域也会被认为是可以自由移动的区域，这样在进行全局路径规划时，可以把一些未探索的未知区域也来参与到路径规划，如果你需要这样的话就将该参数设置为false。不过一般情况未探索的区域不应该当作可以自由移动的区域，因此一般将该参数设置为true;
    - _obstacle_range(default: 2.5)_: 设置机器人检测障碍物的最大范围，意思是说超过该范围的障碍物，并不进行检测，只有靠近到该范围内才把该障碍物当作影响路径规划和移动的障碍物;
    - _raytrace_range(default: 3.0)_: 在机器人移动过程中，实时清除代价地图上的障碍物的最大范围，更新可自由移动的空间数据。假如设置该值为3米，那么就意味着在3米内的障碍物，本来开始时是有的，但是本次检测却没有了，那么就需要在代价地图上来更新，将旧障碍物的空间标记为可以自由移动的空间
    - _observation_sources_: 设置导航中所使用的传感器，这里可以用逗号形式来区分开很多个传感器，例如激光雷达，碰撞传感器，超声波传感器等，我这里只设置了激光雷达;
      - data_type: 激光雷达数据类型;
      - topic: 该激光雷达发布的话题名;
      - marking: 是否可以使用该传感器来标记障碍物;
      - clearing: 是否可以使用该传感器来清除障碍物标记为自由空间;
      - _max_obstacle_height(default: 2.0)_: 以米为单位插入costmap的任何障碍物的最大高度。此参数应设置为略高于机器人的高度。
      - _min_obstacle_height_: 传感器读数的最小高度（以米为单位）视为有效。通常设置为地面高度。
  - **inflation_layer**: 膨胀层，用于在障碍物外标记一层危险区域，在路径规划时需要避开该危险区域
    - _enabled_: 是否启用该层;
    - _cost_scaling_factor(default: 10.0)_: 膨胀过程中应用到代价值的比例因子，代价地图中到实际障碍物距离在内切圆半径到膨胀半径之间的所有cell可以使用如下公式来计算膨胀代价：exp(-1.0 \* cost_scaling_factor \* (distance_from_obstacle – inscribed_radius)) \* (costmap_2d::INSCRIBED_INFLATED_OBSTACLE – 1)公式中costmap_2d::INSCRIBED_INFLATED_OBSTACLE目前指定为254，注意： 由于在公式中cost_scaling_factor被乘了一个负数，所以增大比例因子反而会降低代价。
    - _inflation_radius(default: 0.55)_: 膨胀半径，膨胀层会把障碍物代价膨胀直到该半径为止，一般将该值设置为机器人底盘的直径大小。
  - **Static_layer**: 静态地图层，即SLAM中构建的地图层
    - _enabled_: 是否启用该地图层;
- global_costmap_params.yaml 全局代价地图配置文件

```yml
global_costmap:
  global_frame: map
  robot_base_frame: base_footprint
  update_frequency: 3.0
  publish_frequency: 2.0
  static_map: true

  transform_tolerance: 0.5
  plugins:
    - { name: static_layer, type: "costmap_2d::StaticLayer" }
    - { name: obstacle_layer, type: "costmap_2d::VoxelLayer" }
    - { name: inflation_layer, type: "costmap_2d::InflationLayer" }
```

- 下面是该全局代价地图配置文件中各参数的意义：
  - **global_frame**：全局代价地图需要在哪个坐标系下运行；
  - **robot_base_frame**：在全局代价地图中机器人本体的基坐标系，就是机器人上的根坐标系。通过global_frame和robot_base_frame就可以计算两个坐标系之间的变换，得知机器人在全局坐标系中的坐标了；
  - **update_frequency**：全局代价地图更新频率(单位:Hz），一般全局代价地图更新频率设置的比较小；
  - **publish_frequency**：全局代价地图发布的频率(单位:Hz）。
  - **static_map**：配置是否使用map_server提供的地图来初始化;如果不需要使用已有的地图或者map_server，最好设置为false；
  - **rolling_window**：是否在机器人移动过程中需要滚动窗口，始终保持机器人在当前窗口中心位置；
  - **transform_tolerance**：坐标系间的转换可以忍受的最大延时。
  - **plugins**：在global_costmap中使用下面三个插件来融合三个不同图层，分别是static_layer、obstacle_layer和inflation_layer，合成一个master_layer来进行全局路径规划。
- local_costmap_params.yaml 本地代价地图配置文件

```yml
local_costmap: global_frame: map robot_base_frame: base_footprint update_frequency: 5.0 publish_frequency: 3.0 static_map: false rolling_window: true width: 5.0 height: 5.0 resolution: 0.1 transform_tolerance: 0.5 plugins: - {name: static_layer, type: "costmap_2d::StaticLayer"} - {name: obstacle_layer, type: "costmap_2d::ObstacleLayer"}
```

- 下面是详细解释每个参数的意义：
  - **global_frame**：在局部代价地图中的全局坐标系，一般需要设置为odom_frame;
  - **robot_base_frame**：机器人本体的基坐标系;
  - **update_frequency**：局部代价地图的更新频率;
  - **publish_frequency**：局部代价地图的发布频率;
  - **static_map**：局部代价地图一般不设置为静态地图，因为需要检测是否在机器人附近有新增的动态障碍物;
  - **rolling_window**：使用滚动窗口，始终保持机器人在当前局部地图的中心位置;
  - **width**：滚动窗口的宽度，单位是米;
  - **height**：滚动窗口的高度，单位是米;
  - **resolution**：地图的分辨率，该分辨率可以从加载的地图相对应的配置文件中获取到;
  - **transform_tolerance**：局部代价地图中的坐标系之间转换的最大可忍受延时;
  - **plugins**：在局部代价地图中，不需要静态地图层，因为我们使用滚动窗口来不断的扫描障碍物，所以就需要融合两层地图（inflation_layer和obstacle_layer）即可，融合后的地图用于进行局部路径规划。

#### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#%E5%85%A8%E5%B1%80%E8%A7%84%E5%88%92%E5%99%A8%E9%85%8D%E7%BD%AE)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#%E5%85%A8%E5%B1%80%E8%A7%84%E5%88%92%E5%99%A8%E9%85%8D%E7%BD%AE)全局规划器配置

- global_planner_params.yaml 全局路径规划配置文件`GlobalPlanner: allow_unknown: **false** default_tolerance: 0.2 visualize_potential: **false** use_dijkstra: **false** use_quadratic: **true** use_grid_path: **false** old_navfn_behavior: **false** lethal_cost: 253 neutral_cost: 66 cost_factor: 0.55 publish_potential: **true** orientation_mode: 0 orientation_window_size: 1`YAML下面来依次解释下各参数意义：
  - **allow_unknown(default: true)**: 是否允许规划器规划穿过未知区域的路径,只设计该参数为true还不行,还要在costmap_commons_params.yaml中设置track_unknown_space参数也为false才行。
  - **default_tolerance(default: 0.0)**: 当设置的目的地被障碍物占据时,需要以该参数为半径寻找到最近的点作为新目的地点.
  - **visualize_potential(default: false)**: 是否显示从PointCloud2计算得到的势区域.
  - **use_dijkstra(default: true)**: 如果设置为true,将使用dijkstra算法,否则使用A\*算法.
  - **use_quadratic(default: true)**: 如果设置为true,将使用二次函数近似函数,否则使用更加简单的计算方式,这样节省硬件计算资源.
  - **use_grid_path(default: false)**: 如果如果设置为true,则会规划一条沿着网格边界的路径,偏向于直线穿越网格,否则将使用梯度下降算法,路径更为光滑点.
  - **old_navfn_behavior(default: false)**: 若在某些情况下,想让global_planner完全复制navfn的功能,那就设置为true,但是需要注意navfn是非常旧的ROS系统中使用的,现在已经都用global_planner代替navfn了,所以不建议设置为true.
  - **lethal_cost(default: 253)**: 致命代价值
  - **neutral_cost(default: 50)**: 中等代价值
  - **cost_factor(default: 3.0)**: 代价地图与每个代价值相乘的因子
  - **publish_potential(default: true)**: 是否发布costmap的势函数
  - **orientation_mode(default: 0)**: 如何设置每个点的方向（None = 0,Forward = 1,Interpolate = 2,ForwardThenInterpolate = 3,Backward = 4,Leftward = 5,Rightward = 6）
  - **orientation_window_size(default: 1)**: 根据orientation_mode指定的位置积分来得到使用窗口的方向。

#### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#%E5%B1%80%E9%83%A8%E8%A7%84%E5%88%92%E5%99%A8%E9%85%8D%E7%BD%AE)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#%E5%B1%80%E9%83%A8%E8%A7%84%E5%88%92%E5%99%A8%E9%85%8D%E7%BD%AE)局部规划器配置

- teb_local_planner_params.yaml TEB局部路径规划配置文件*关于teb和dwa的调参同样可以使用rqt_reconfigure实现*[](https://i.loli.net/2020/08/05/x6IunsDvTafHgSB.png)

关于TEB_local_planner的调整网上有很多但都参差不齐，大家可以自己google一下，博主提供的源码包里没有用teb进行运动控制，只利用了它规划出的局部路径所以这一块也没有调的很明白，我把ROS Wiki上的teb_local_planner参数说明做了一个表方便大家查阅：

| 参数                              | 类型   | 含义                                                                                                                                                                                                                                                                                                                            | 最小  | 默认  | 最大 |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----- | ---- |
| teb_autosize                      | bool   | 优化期间允许改变轨迹的时域长度；Enable the automatic resizing of the trajectory during optimization (based on the temporal resolution of the trajectory, recommended)                                                                                                                                                           | False | True  | True |
| dt_ref                            | double | 局部路径规划的解析度;Temporal resolution of the planned trajectory (usually it is set to the magnitude of the 1/control_rate)                                                                                                                                                                                                   | 0.01  | 0.3   | 1.0  |
| dt_hysteresis                     | double | 允许改变的时域解析度的浮动范围， 一般为 dt_ref 的 10% 左右; Hysteresis that is utilized for automatic resizing depending on the current temporal resolution (dt): usually 10% of dt_ref                                                                                                                                         | 0.002 | 0.1   | 0.5  |
| global_plan_overwrite_orientation | bool   | 覆盖全局路径中局部路径点的朝向，Some global planners are not considering the orientation at local subgoals between start and global goal, therefore determine it automatically                                                                                                                                                  | False | True  | True |
| allow_init_with_backwards_motion  | bool   | 允许在开始时想后退来执行轨迹，If true, the underlying trajectories might be initialized with backwards motions in case the goal is behind the start within the local costmap (this is only recommended if the robot is equipped with rear sensors)                                                                              | False | False | True |
| max_global_plan_lookahead_dist    | double | 考虑优化的全局计划子集的最大长度（累积欧几里得距离）（如果为0或负数：禁用；长度也受本地Costmap大小的限制）， Specify maximum length (cumulative Euclidean distances) of the subset of the global plan taken into account for optimization \[if 0 or negative: disabled; the length is also bounded by the local costmap size \] | 0.0   | 3.0   | 50.0 |
| force_reinit_new_goal_dist        | double | 如果上一个目标的间隔超过指定的米数（跳过热启动），则强制规划器重新初始化轨迹，Force the planner to reinitialize the trajectory if a previous goal is updated with a seperation of more than the specified value in meters (skip hot-starting)                                                                                   | 0.0   | 1.0   | 10.0 |
| feasibility_check_no_poses        | int    | 检测位姿可到达的时间间隔，Specify up to which pose on the predicted plan the feasibility should be checked each sampling interval                                                                                                                                                                                               | 0     | 5     | 50   |
| exact_arc_length                  | bool   | 如果为真，规划器在速度、加速度和转弯率计算中使用精确的弧长\[->增加的CPU时间\]，否则使用欧几里德近似。If true, the planner uses the exact arc length in velocity, acceleration and turning rate computations \[-> increased cpu time\], otherwise the euclidean approximation is used.                                           | False | False | True |

| publish_feedback                    | bool   | 发布包含完整轨迹和活动障碍物列表的规划器反馈，Publish planner feedback containing the full trajectory and a list of active obstacles (should be enabled only for evaluation or debugging purposes)                                                           | False | False | True  |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | ----- | ----- |
| visualize_with_time_as_z_axis_scale | double | 如果该值大于0，则使用该值缩放的Z轴的时间在3D中可视化轨迹和障碍物。最适用于动态障碍。 If this value is bigger than 0, the trajectory and obstacles are visualized in 3d using the time as the z-axis scaled by this value. Most useful for dynamic obstacles. | 0.0   | 0.0   | 1.0   |
| global_plan_viapoint_sep            | double | 从全局计划中提取的每两个连续通过点之间的最小间隔\[如果为负：禁用\]， Min. separation between each two consecutive via-points extracted from the global plan \[if negative: disabled\]                                                                        | \-0.1 | \-0.1 | 5.0   |
| via_points_ordered                  | bool   | 如果为真，规划器遵循存储容器中通过点的顺序。If true, the planner adheres to the order of via-points in the storage container                                                                                                                                 | False | False | True  |
| max_vel_x                           | double | 最大x前向速度，Maximum translational velocity of the robot                                                                                                                                                                                                   | 0.01  | 0.4   | 100.0 |
| max_vel_x_backwards                 | double | 最大x后退速度，Maximum translational velocity of the robot for driving backwards                                                                                                                                                                             | 0.01  | 0.2   | 100.0 |
| max_vel_theta                       | double | 最大转向叫速度 Maximum angular velocity of the robot                                                                                                                                                                                                         | 0.01  | 0.3   | 100.0 |
| acc_lim_x                           | double | 最大x加速度，Maximum translational acceleration of the robot                                                                                                                                                                                                 | 0.01  | 0.5   | 100.0 |
| acc_lim_theta                       | double | 最大角速度，Maximum angular acceleration of the robot                                                                                                                                                                                                        | 0.01  | 0.5   | 100.0 |
| is_footprint_dynamic                | bool   | 是否footprint 为动态的，If true, updated the footprint before checking trajectory feasibility                                                                                                                                                                | False | False | True  |

| min_turning_radius       | double | **车类机器人的最小转弯半径，Minimum turning radius of a carlike robot (diff-drive robot: zero)**                                                                                                                                                                                                                 | 0.0    | 0.0   | 50.0  |
| ------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----- | ----- |
| wheelbase                | double | 驱动轴和转向轴之间的距离（仅适用于启用了“Cmd_angle\_而不是\_rotvel”的Carlike机器人）；对于后轮式机器人，该值可能为负值！ The distance between the drive shaft and steering axle (only required for a carlike robot with ‘cmd_angle_instead_rotvel’ enabled); The value might be negative for back-wheeled robots | \-10.0 | 1.0   | 10.0  |
| cmd_angle_instead_rotvel | bool   | 将收到的角速度消息转换为 操作上的角度变化。 Substitute the rotational velocity in the commanded velocity message by the corresponding steering angle (check ‘axles_distance’)                                                                                                                                    | False  | False | True  |
| max_vel_y                | double | 最大y方向速度， Maximum strafing velocity of the robot (should be zero for non-holonomic robots!)                                                                                                                                                                                                                | 0.0    | 0.0   | 100.0 |
| acc_lim_y                | double | 最大y向加速度， Maximum strafing acceleration of the robot                                                                                                                                                                                                                                                       | 0.01   | 0.5   | 100.0 |
| xy_goal_tolerance        | double | 目标 xy 偏移容忍度，Allowed final euclidean distance to the goal position                                                                                                                                                                                                                                        | 0.001  | 0.2   | 10.0  |
| yaw_goal_tolerance       | double | 目标 角度 偏移容忍度， Allowed final orientation error to the goal orientation                                                                                                                                                                                                                                   | 0.001  | 0.1   | 3.2   |
| free_goal_vel            | bool   | 允许机器人以最大速度驶向目的地， Allow the robot’s velocity to be nonzero for planning purposes (the robot can arrive at the goal with max speed)                                                                                                                                                                | False  | False | True  |
| min_obstacle_dist        | double | 和障碍物最小距离， Minimum desired separation from obstacles                                                                                                                                                                                                                                                     | 0.0    | 0.5   | 10.0  |
| inflation_dist           | double | 障碍物膨胀距离， Buffer zone around obstacles with non-zero penalty costs (should be larger than min_obstacle_dist in order to take effect)                                                                                                                                                                      | 0.0    | 0.6   | 15.0  |

| include_dynamic_obstacles                   | bool   | 是否将动态障碍物预测为速度模型， Specify whether the movement of dynamic obstacles should be predicted by a constant velocity model (this also changes the homotopy class search). If false, all obstacles are considered to be static.                                                                                                        | False | False | True  |
| ------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----- | ----- |
| include_costmap_obstacles                   | bool   | costmap 中的障碍物是否被直接考虑， Specify whether the obstacles in the costmap should be taken into account directly (this is necessary if no seperate clustering and detection is implemented)                                                                                                                                               | False | True  | True  |
| legacy_obstacle_association                 | bool   | 是否严格遵循局部规划出来的路径， If true, the old association strategy is used (for each obstacle, find the nearest TEB pose), otherwise the new one (for each teb pose, find only ‘relevant’ obstacles).                                                                                                                                      | False | False | True  |
| obstacle_association_force_inclusion_factor | double | The non-legacy obstacle association technique tries to connect only relevant obstacles with the discretized trajectory during optimization, all obstacles within a specifed distance are forced to be included (as a multiple of min_obstacle_dist), e.g. choose 2.0 in order to consider obstacles within a radius of 2.0\*min_obstacle_dist. | 0.0   | 1.5   | 100.0 |
| obstacle_association_cutoff_factor          | double | See obstacle_association_force_inclusion_factor, but beyond a multiple of \[value\]\*min_obstacle_dist all obstacles are ignored during optimization. obstacle_association_force_inclusion_factor is processed first.                                                                                                                          | 1.0   | 5.0   | 100.0 |
| costmap_obstacles_behind_robot_dist         | double | Limit the occupied local costmap obstacles taken into account for planning behind the robot (specify distance in meters)                                                                                                                                                                                                                       | 0.0   | 1.5   | 20.0  |
| obstacle_poses_affected                     | int    | The obstacle position is attached to the closest pose on the trajectory to reduce computational effort, but take a number of neighbors into account as well                                                                                                                                                                                    | 0     | 30    | 200   |
| no_inner_iterations                         | int    | 被外循环调用后内循环执行优化次数， Number of solver iterations called in each outerloop iteration                                                                                                                                                                                                                                              | 1     | 5     | 100   |
| no_outer_iterations                         | int    | 执行的外循环的优化次数， Each outerloop iteration automatically resizes the trajectory and invokes the internal optimizer with no_inner_iterations                                                                                                                                                                                             | 1     | 4     | 100   |
| optimization_activate                       | bool   | 激活优化， Activate the optimization                                                                                                                                                                                                                                                                                                           | False | True  | True  |

| optimization_verbose            | bool   | 打印优化过程详情， Print verbose information                                                                                                                                      | False | False  | True    |
| ------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------ | ------- |
| penalty_epsilon                 | double | 对于硬约束近似，在惩罚函数中添加安全范围， Add a small safty margin to penalty functions for hard-constraint approximations                                                       | 0.0   | 0.1    | 1.0     |
| weight_max_vel_x                | double | 最大x速度权重， Optimization weight for satisfying the maximum allowed translational velocity                                                                                     | 0.0   | 2.0    | 1000.0  |
| weight_max_vel_y                | double | 最大y速度权重，Optimization weight for satisfying the maximum allowed strafing velocity (in use only for holonomic robots)                                                        | 0.0   | 2.0    | 1000.0  |
| weight_max_vel_theta            | double | 最大叫速度权重， Optimization weight for satisfying the maximum allowed angular velocity                                                                                          | 0.0   | 1.0    | 1000.0  |
| weight_acc_lim_x                | double | 最大x 加速度权重，Optimization weight for satisfying the maximum allowed translational acceleration                                                                               | 0.0   | 1.0    | 1000.0  |
| weight_acc_lim_y                | double | 最大y 加速度权重，Optimization weight for satisfying the maximum allowed strafing acceleration (in use only for holonomic robots)                                                 | 0.0   | 1.0    | 1000.0  |
| weight_acc_lim_theta            | double | 最大角速度权重，Optimization weight for satisfying the maximum allowed angular acceleration                                                                                       | 0.0   | 1.0    | 1000.0  |
| weight_kinematics_nh            | double | Optimization weight for satisfying the non-holonomic kinematics                                                                                                                   | 0.0   | 1000.0 | 10000.0 |
| weight_kinematics_forward_drive | double | 优化过程中，迫使机器人只选择前进方向，差速轮适用，Optimization weight for forcing the robot to choose only forward directions (positive transl. velocities, only diffdrive robot) | 0.0   | 1.0    | 1000.0  |

| weight_kinematics_turning_radius  | double | **优化过程中，车型机器人的最小转弯半径的权重。 Optimization weight for enforcing a minimum turning radius (carlike robots)**                                                                                                                                                                                 | 0.0   | 1.0  | 1000.0 |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | ---- | ------ |
| weight_optimaltime                | double | 优化过程中，基于轨迹的时间上的权重， Optimization weight for contracting the trajectory w.r.t transition time                                                                                                                                                                                                | 0.0   | 1.0  | 1000.0 |
| weight_obstacle                   | double | 优化过程中，和障碍物最小距离的权重，Optimization weight for satisfying a minimum seperation from obstacles                                                                                                                                                                                                   | 0.0   | 50.0 | 1000.0 |
| weight_inflation                  | double | 优化过程中， 膨胀区的权重，Optimization weight for the inflation penalty (should be small)                                                                                                                                                                                                                   | 0.0   | 0.1  | 10.0   |
| weight_dynamic_obstacle           | double | 优化过程中，和动态障碍物最小距离的权重，Optimization weight for satisfying a minimum seperation from dynamic obstacles                                                                                                                                                                                       | 0.0   | 50.0 | 1000.0 |
| weight_dynamic_obstacle_inflation | double | 优化过程中，和动态障碍物膨胀区的权重，Optimization weight for the inflation penalty of dynamic obstacles (should be small)                                                                                                                                                                                   | 0.0   | 0.1  | 10.0   |
| _**weight_viapoint**_             | double | 优化过程中，和全局路径采样点距离的权重， Optimization weight for minimizing the distance to via-points                                                                                                                                                                                                       | 0.0   | 1.0  | 1000.0 |
| weight_adapt_factor               | double | Some special weights (currently ‘weight_obstacle’) are repeatedly scaled by this factor in each outer TEB iteration (weight_new: weight_old \* factor); Increasing weights iteratively instead of setting a huge value a-priori leads to better numerical conditions of the underlying optimization problem. | 1.0   | 2.0  | 100.0  |
| enable_multithreading             | bool   | 允许多线程并行处理， Activate multiple threading for planning multiple trajectories in parallel                                                                                                                                                                                                              | False | True | True   |
| max_number_classes                | int    | 允许的线程数， Specify the maximum number of allowed alternative homotopy classes (limits computational effort)                                                                                                                                                                                              | 1     | 5    | 100    |

| selection_cost_hysteresis       | double | Specify how much trajectory cost must a new candidate have w.r.t. a previously selected trajectory in order to be selected (selection if new_cost < old_cost\*factor)                                                                                                              | 0.0   | 1.0   | 2.0    |
| ------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----- | ------ |
| selection_prefer_initial_plan   | double | Specify a cost reduction in the interval (0,1) for the trajectory in the equivalence class of the initial plan.)                                                                                                                                                                   | 0.0   | 0.95  | 1.0    |
| selection_obst_cost_scale       | double | Extra scaling of obstacle cost terms just for selecting the ‘best’ candidate (new_obst_cost: obst_cost\*factor)                                                                                                                                                                    | 0.0   | 100.0 | 1000.0 |
| selection_viapoint_cost_scale   | double | Extra scaling of via-point cost terms just for selecting the ‘best’ candidate. (new_viapt_cost: viapt_cost\*factor)                                                                                                                                                                | 0.0   | 1.0   | 100.0  |
| selection_alternative_time_cost | bool   | If true, time cost is replaced by the total transition time.                                                                                                                                                                                                                       | False | False | True   |
| switching_blocking_period       | double | Specify a time duration in seconds that needs to be expired before a switch to new equivalence class is allowed                                                                                                                                                                    | 0.0   | 0.0   | 60.0   |
| roadmap_graph_no_samples        | int    | Specify the number of samples generated for creating the roadmap graph, if simple_exploration is turend off                                                                                                                                                                        | 1     | 15    | 100    |
| roadmap_graph_area_width        | double | Specify the width of the area in which sampled will be generated between start and goal \[m \] (the height equals the start-goal distance)                                                                                                                                         | 0.1   | 5.0   | 20.0   |
| roadmap_graph_area_length_scale | double | 矩形区域的长度取决于起点和目标之间的距离。 此参数进一步缩放距离，以使几何中心保持相等！The length of the rectangular region is determined by the distance between start and goal. This parameter further scales the distance such that the geometric center remains equal!)        | 0.5   | 1.0   | 2.0    |
| h_signature_prescaler           | double | 标度障碍物的数量，以允许数量巨大的障碍物。 不要选择太低，否则无法将障碍物彼此区分开（0.2 <H <= 1）Scale number of obstacle value in order to allow huge number of obstacles. Do not choose it extremly low, otherwise obstacles cannot be distinguished from each other (0.2<H<=1) | 0.2   | 1.0   | 1.0    |

| h_signature_threshold      | double | 如果实部和复数部分的差都低于指定的阈值，则假设两个h-符号相等Two h-signuteres are assumed to be equal, if both the difference of real parts and complex parts are below the specified threshold                                                                                                                                           | 0.0   | 0.1   | 1.0  |
| -------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----- | ---- |
| obstacle_heading_threshold | double | 指定障碍物航向和目标航向之间的归一化标量积的值，以便将它们(障碍物)考虑在内进行探索Specify the value of the normalized scalar product between obstacle heading and goal heading in order to take them (obstacles) into account for exploration                                                                                            | 0.0   | 0.45  | 1.0  |
| viapoints_all_candidates   | bool   | 如果为TRUE，则将不同拓扑的所有轨迹附加到通过点集合，否则仅附加与初始/全局计划共享相同的轨迹(在TEST_OPTIM_NODE中无效)。If true, all trajectories of different topologies are attached to the set of via-points, otherwise only the trajectory sharing the same one as the initial/global plan is attached (no effect in test_optim_node). | False | True  | True |
| visualize_hc_graph         | bool   | 可视化新创建的图Visualize the graph that is created for exploring new homotopy classes                                                                                                                                                                                                                                                   | False | False | True |
| shrink_horizon_backup      | bool   | 当规划器检测到系统异常，允许缩小时域规划范围。Allows the planner to shrink the horizon temporary (50%) in case of automatically detected issues.                                                                                                                                                                                         | False | True  | True |
| oscillation_recovery       | bool   | 尝试检测和解决振荡，Try to detect and resolve oscillations between multiple solutions in the same equivalence class (robot frequently switches between left/right/forward/backwards).                                                                                                                                                    | False | True  | True |

博主的teb配置：

```yml
TebLocalPlannerROS:
  odom_topic: /odom111

  # Trajectory

  teb_autosize: True
  dt_ref: 0.3
  dt_hysteresis: 0.1
  max_samples: 500
  global_plan_overwrite_orientation: True
  allow_init_with_backwards_motion: True
  max_global_plan_lookahead_dist: 3.0
  global_plan_viapoint_sep: -1
  global_plan_prune_distance: 1
  exact_arc_length: False
  feasibility_check_no_poses: 2
  publish_feedback: False

  # Robot

  max_vel_x: 0.5
  max_vel_x_backwards: 0.2
  max_vel_y: 0.0
  max_vel_theta: 0.3 # the angular velocity is also bounded by min_turning_radius in case of a carlike robot (r = v / omega)
  acc_lim_x: 0.5
  acc_lim_theta: 0.5

  # ********************** Carlike robot parameters ********************
  min_turning_radius: 0.15 # Min turning radius of the carlike robot (compute value using a model or adjust with rqt_reconfigure manually)
  wheelbase: 0.31 # Wheelbase of our robot
  cmd_angle_instead_rotvel: True # stage simulator takes the angle instead of the rotvel as input (twist message)
  # ********************************************************************

  footprint_model: # types: "point", "circular", "two_circles", "line", "polygon"
    type: "polygon"
    radius: 0.2 # for type "circular"
    line_start: [0.5, 0.0] # for type "line"
    line_end: [-0.08, 0.0] # for type "line"
    front_offset: 0.2 # for type "two_circles"
    front_radius: 0.2 # for type "two_circles"
    rear_offset: 0.2 # for type "two_circles"
    rear_radius: 0.2 # for type "two_circles"
    vertices: [[0.27, 0.23], [0.27, -0.23], [-0.27, -0.23], [-0.27, 0.23]] # for type "polygon"

  # GoalTolerance

  xy_goal_tolerance: 0.2
  yaw_goal_tolerance: 0.1
  free_goal_vel: False
  complete_global_plan: True

  # Obstacles

  min_obstacle_dist: 0.05 # This value must also include our robot's expansion, since footprint_model is set to "line".
  inflation_dist: 0.5
  include_costmap_obstacles: True
  costmap_obstacles_behind_robot_dist: 1.0
  obstacle_poses_affected: 5

  dynamic_obstacle_inflation_dist: 0.6
  include_dynamic_obstacles: True

  costmap_converter_plugin: ""
  costmap_converter_spin_thread: True
  costmap_converter_rate: 5

  # Optimization

  no_inner_iterations: 5
  no_outer_iterations: 4
  optimization_activate: True
  optimization_verbose: False
  penalty_epsilon: 0.1
  obstacle_cost_exponent: 4
  weight_max_vel_x: 2
  weight_max_vel_theta: 1
  weight_acc_lim_x: 1
  weight_acc_lim_theta: 1
  weight_kinematics_nh: 1000
  weight_kinematics_forward_drive: 1
  weight_kinematics_turning_radius: 1
  weight_optimaltime: 1 # must be > 0
  weight_shortest_path: 0
  weight_obstacle: 100
  weight_inflation: 0.2
  weight_dynamic_obstacle: 10 # not in use yet
  weight_dynamic_obstacle_inflation: 0.2
  weight_viapoint: 1
  weight_adapt_factor: 2

  # Homotopy Class Planner

  enable_homotopy_class_planning: True
  enable_multithreading: True
  max_number_classes: 4
  selection_cost_hysteresis: 1.0
  selection_prefer_initial_plan: 0.95
  selection_obst_cost_scale: 1.0
  selection_alternative_time_cost: False

  roadmap_graph_no_samples: 15
  roadmap_graph_area_width: 5
  roadmap_graph_area_length_scale: 1.0
  h_signature_prescaler: 0.5
  h_signature_threshold: 0.1
  obstacle_heading_threshold: 0.45
  switching_blocking_period: 0.0
  viapoints_all_candidates: True
  delete_detours_backwards: True
  max_ratio_detours_duration_best_duration: 3.0
  visualize_hc_graph: False
  visualize_with_time_as_z_axis_scale: False

  # Recovery

  shrink_horizon_backup: True
  shrink_horizon_min_duration: 10
  oscillation_recovery: True
  oscillation_v_eps: 0.1
  oscillation_omega_eps: 0.1
  oscillation_recovery_min_duration: 10
  oscillation_filter_duration: 10
```

至于其他局部路径规划器的配置建议参考网上的教程

### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#Navigation-Global-Planner)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#Navigation-Global-Planner)Navigation - Global Planner

依赖于`nav core::BaseGlobalPlanner`接口的全局规划器有3个：

1.`carrot_planner`

2.`navfn`

3.`global planner`

比较常用的是后两个，博主提供的代码包用的是global planner

##### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#carrot-planner)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#carrot-planner)carrot_planner

carrot_planner检查需要到达的目标是不是一个障碍物，如果是一个障碍物，它就将目标点替换成一个附近可接近的点。因此，这个模块其实并没有做任何全局规划的工作。在复杂的室内环境中，这个模块并不实用。

##### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#navfn)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#navfn)navfn

`navfn`使用Dijkstra算法找到最短路径。

##### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#global-planner)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#global-planner)global planner

`global planner`是`navfn`的升级版。它相对于`navfn`增加了更多的选项：

1）支持A\*算法；

2）可以切换二次近似；

3）切换网格路径；

##### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#navfn%E5%92%8Cglobal-planner)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#navfn%E5%92%8Cglobal-planner)navfn和global_planner

关于navfn和global_planner的区别有一篇博客写的很清楚：[博文链接](https://blog.csdn.net/heyijia0327/article/details/45030929)

简单来说可以将navfn包和global_planner包理解成一个并列关系，因为他们两个都是用来做全局规划的，两个包里面也都实现了A\*，Dijkstra算法。早期的开发中是用navfn包做导航的，那时候并没有global_planner这个包，并且在navfn的源代码里可以看到这个包默认是使用Dijkstra做全局路径规划，并且有A\*的代码。但先前navfn里的A\*算法存在bug，没人有时间去弄，到13年David Lu才完成了这部分工作，重新发布了global_planner包，修改好的代码封装性更强，更清晰明了，同时为了和以前兼容就没有用global_planner替换掉navfn。

#### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#Dijkstra-%E5%92%8C-A)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#Dijkstra-%E5%92%8C-A)Dijkstra 和 A\*

关于Dijkstra算法和A\*算法的原理这里就不再阐述了，有兴趣的朋友可以自行google

这里主要通过图像和动画直观的看一下两种算法规划出的路径区别：https://www.youtube.com/embed/g024lzsknDo

如果youtube视频感觉还不直观的话有一个github上搭建的项目可以很方便的可视化包括A\*和Dijkstra算法在内的多种不同路径规划算法的区别，对于A\*和Dijkstra算法还可以可视化其不同实现方式下规划的结果：[github传送门](https://qiao.github.io/PathFinding.js/visual/)

- A\*算法不带障碍物效果

[![image-20200805141114490](/assets/images/Qnshgy3KLdFDwbf.png)](https://i.loli.net/2020/08/05/Qnshgy3KLdFDwbf.png)

image-20200805141114490

- Dijkstra算法不带障碍物效果

[![image-20200805141232494](/assets/images/4mMGoP39chwXgHL.png)](https://i.loli.net/2020/08/05/4mMGoP39chwXgHL.png)

image-20200805141232494

- A\*算法带障碍物效果

[![image-20200805141327151](/assets/images/IDz9kOlrPN3dBa2.png)](https://i.loli.net/2020/08/05/IDz9kOlrPN3dBa2.png)

image-20200805141327151

- Dijkstra算法带障碍物效果

[![image-20200805141347334](/assets/images/RhF6Xj3D8wt7YA5.png)](https://i.loli.net/2020/08/05/RhF6Xj3D8wt7YA5.png)

image-20200805141347334

两种不同算法体现到咱们racecar里具体就是：

左图为Dijkstra，右图为A\*[](https://i.loli.net/2020/08/06/mfLrbjOSxXJcYtG.png)　　　　　[](https://i.loli.net/2020/08/06/qYlsKCnxNuhA3oe.png)

### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#Navigation-Local-Planner)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#Navigation-Local-Planner)Navigation - Local Planner

对于室内小车，ROS社区已有很多大牛们贡献了各种不同的局部规划器，总结主要有以下几种：

- [base_local_planner](http://wiki.ros.org/base_local_planner)
- [DWA_local_planner](http://wiki.ros.org/dwa_local_planner)
- [DWB_local_planner](http://wiki.ros.org/dwb_local_planner)
- [asr_ftc_local_planner](http://wiki.ros.org/asr_ftc_local_planner)
- [TEB_local_planner](http://wiki.ros.org/teb_local_planner)
- [Eband_local_planner](http://wiki.ros.org/eband_local_planner)

比较常用的是base_local_planner、DWA_local_planner和TEB_local_planner，

#### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#TEB-lcoal-planner)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#TEB-lcoal-planner)TEB_lcoal_planner

`teb_local_planner`实现了一个在线优化的局部轨迹规划器，用于移动机器人的导航和控制，可以作为ROS导航包的插件。

由全局规划器生成的初始轨迹在运行期间进行优化，以最小化轨迹的执行时间（时间最优目标），与障碍物分离处理，满足诸如最大速度和加速度的动力学约束。

`teb_local_planner`的当前实现符合非完整机器人（差动驱动和类似汽车的机器人）的运动学特征。  
（注：对地面移动机器人来说，非完整机器人指*X*—方向有速度，而*Y*\-速度为0的机器人）

**注意**:`teb_local_planner`的最重要特征在于：在行进过程中调整机器人的朝向以使到达位置时的朝向是所要的朝向，因此行进过程中会有倒车（左图）。此外，它在行进过程中也不会紧密贴合路径（右图），但可以调大*weight_viapoint*和*global_plan_viapoint_sep*来调整。[](https://i.loli.net/2020/08/05/qBbACo9VGEXkzhT.png)[](https://i.loli.net/2020/08/05/1ONC4buEZQMFjrm.png)

#### [](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#DWA-local-planner)[](https://zacdeng.github.io/2020/08/05/racecar%E4%BB%BF%E7%9C%9F%E7%AB%9E%E8%B5%9B%E7%BB%8F%E9%AA%8C%E6%80%BB%E7%BB%93%EF%BC%88%E5%85%AD%EF%BC%89-%20Navigation%E5%AF%BC%E8%88%AA%E5%8C%85/#DWA-local-planner)DWA_local_planner

`base_local_planner`包含有轨迹展开(Trajectory Rollout)和动态窗口方法（Dynamic Window Approach,DWA）算法。基本思想如下：

1. 在机器人的控制空间（dx，dy，dtheta）中进行离散采样。
2. 对于每个采样速度，从机器人的当前状态执行前向模拟，以预测如果应用采样速度在某个（短）时间段内会发生什么情况。
3. 使用包含以下特征的度量来评估（评分）由前向模拟产生的每个轨迹：接近障碍物程度，接近目标程度，接近全局路径程度和采用的速度。丢弃非法轨迹（与障碍物碰撞的轨迹）。
4. 选择得分最高的轨迹并将相关的速度发送到移动基座。
5. 清零并重复。

DWA与“Trajectory Rollout”的不同之处在于如何对机器人的控制空间进行采样。在给定机器人的加速度极限的情况下，Trajectory Rollout在整个前向模拟周期内从可实现的速度集合中进行采样，而DWA在给定机器人的加速度极限的情况下仅针对一个模拟步骤从可实现的速度集合中进行采样。这意味着DWA是一种更有效的算法，因为它可以采样更小的空间，但是对于具有低加速度限制的机器人，可能性能不如“Trajectory Rollout”，因为DWA不会向前模拟恒定加速度。然而，在实践中，我们发现DWA和轨迹展示在我们的所有测试中都具有相同的性能，建议使用DWA来提高效率。

同时dwa_local_planner包提供了一个控制器，用于驱动在所述平面上的移动基座。该控制器用于将路径规划器连接到机器人。使用地图，规划器为机器人创建从一个起点到目标位置的运动轨迹。在此过程中，计划员至少在机器人周围创建一个值函数，表示为网格图。该值函数编码遍历网格单元的成本。控制器的工作是使用此值函数来确定要发送给机器人的dx，dy，dtheta速度。[](https://i.loli.net/2020/08/05/C2nbsNX19oGAqQe.png)
