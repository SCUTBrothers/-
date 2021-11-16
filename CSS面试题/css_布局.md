# css布局

## 常见的css布局单位

1. 绝对单位: px, deg(transform: rotate(...deg))
2. 相对单位: em, rem, vw/vh, 百分比

## 两栏布局的实现

首先要了解两栏布局的实现目标:

1. 两个元素同行显示
2. 左侧元素宽度固定, 右侧元素宽度自适应

**两个元素同行显示的方式**

- 普通文档流: 双行内元素;
- 脱离文档流: 双浮动元素; 左浮动 + 右BFC; 左浮动 + 绝对定位(当然, 两个绝对定位也行)
- 普通文档流的特殊布局方式: 父元素为 表格布局; 或者flex布局

**右侧元素宽度自适应的方式**

- width: calc(100% - 左侧元素的宽度)
- 其余方式在两栏布局的实现方式当中细说

**两栏布局的实现方式及注意点**

首先左侧元素宽度一直是固定的

1. 双inline-block, 右侧元素width: calc(100% - 左侧元素的宽度)
2. 双浮动: 两个元素浮动方向相同, 右侧元素width: calc(100% - 左侧元素的宽度)
3. 左元素浮动, 右元素BFC块元素: 由于具有BFC的元素不会与浮动元素重叠, 当该元素width为auto时, 浏览器会自动计算它的宽度
4. 左浮动 + 绝对定位: 右侧绝对定位元素的margin-left=左侧元素的宽度
5. 父元素为表格布局(display: table), 左右元素display: table-cell, 表格布局会自动补齐右侧元素的宽度, 占满剩余空间
6. 父元素为flex布局(display: flex), 左侧元素flex-grow: 0, 右侧元素flex-grow: 1, 右侧元素会占满空余的可用空间

注意点

- 第1种, 需要注意inline-block之间的**空白符**问题, inline-block默认以基线对齐, 可能需要设置vertical-align: top
- 第2-4种, 需要注意浮动元素或者绝对定位元素溢出容器之外, 需要对容器元素设置min-height或者清除浮动(针对浮动布局)

## 三栏布局的实现

个人总结了7种

1. 普通文档流布局(三inline-block, 或者三浮动也行, 关键在于width: calc(...))

注意点: 需要解决**空白符问题**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      .container {
        font-size: 0;
        height: 200px;
        outline: 1px solid blue;
      }

      .box {
        height: 200px;
      }

      .left {
        display: inline-block;

        width: 100px;

        font-size: 1rem;

        background-color: red;
      }

      .center {
        display: inline-block;
        width: calc(100% - 300px);

        font-size: 1rem;

        background-color: blue;
      }

      .right {
        display: inline-block;

        width: 200px;

        font-size: 1rem;

        background-color: green;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="box left">left</div>
      <div class="box center">center</div>
      <div class="box right">right</div>
    </div>
  </body>
</html>
```


2. 左浮动 + 右浮动 +后普通流布局(center放在最后面, 可以给普通流元素设置BFC)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      .container {
        height: 200px;
        outline: 1px solid blue;
      }

      .box {
        height: 200px;
      }

      .left {
        float: left;

        width: 100px;

        background-color: red;
      }

      .center {
        /* overflow: hidden; 如果设置BFC, 那么可以不用设置margin*/
        margin: 0 200px 0 100px;

        background-color: blue;
      }

      .right {
        float: right;

        width: 200px;

        background-color: green;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="box left"></div>
      <div class="box right"></div>
      <div class="box center"></div>
    </div>
  </body>
</html>
```

3. 圣杯布局(center在前, left和right在后)

主要思路:

1. container容器设置左右外边距, 预留给左右元素空间
2. 所有元素向左浮动, center元素在html文档中位于头部, 将center元素宽度设置为100%(等于container宽度)
3. left元素设置左负边距-100%, 因为left元素左侧html元素是center元素, 所以它会相对container的宽度的100%向左移动. 然后设置相对定位position: relative, 定义偏移量left: -left元素的宽度, 让它相对静态初始位置向左移动
4. right元素设置左负边距-right元素的宽度, 使得right向左移动, 超过自身边界所以上移. 然后设置相对定位position: relative, 定义右侧偏移right: -right元素的宽度

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      body {
        margin: 0;
        padding: 0;
      }

      .container {
        margin-left: 100px;
        margin-right: 200px;
        height: 200px;

        outline: 1px solid blue;
      }

      .box {
        height: 200px;
      }

      .left {
        float: left;
        position: relative;
        left: -100px;

        margin-left: -100%;
        width: 100px;

        background-color: red;
      }

      .center {
        float: left;

        width: 100%;

        background-color: blue;
      }

      .right {
        float: left;
        position: relative;
        right: -200px;

        margin-left: -200px;
        width: 200px;

        background-color: green;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="box center">center</div>
      <div class="box left">left</div>
      <div class="box right">right</div>
    </div>
  </body>
</html>
```

4. 双飞翼布局

主要思路与圣杯布局大致相同:

1. container容器只包括center元素, container容器宽度为100%, center元素设置左右margin给左右元素预留显示空间
2. container容器, 左元素和右元素向左浮动
2. 左元素负边距-100%, 相对container容器的宽度向左移动, 然后左边界靠着container容器的左边界
3. 右元素负边距=-自身的宽度, 使得自己上移, 右边界靠着container的右边界

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      body {
        margin: 0;
        padding: 0;
      }

      .container {
        float: left;

        width: 100%;
        height: 200px;

        outline: 1px solid blue;
      }

      .box {
        height: 200px;
      }

      .left {
        float: left;

        margin-left: -100%;
        width: 100px;

        background-color: red;
      }

      .center {
        margin-left: 100px;
        margin-right: 200px;

        background-color: blue;
      }

      .right {
        float: left;

        margin-left: -200px;
        width: 200px;

        background-color: green;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="box center">center</div>
    </div>
    <div class="box left">left</div>
    <div class="box right">right</div>
  </body>
</html>
```

5. table布局

需要注意的点: container的display设置为table, 而不是table-row

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      body {
        margin: 0;
        padding: 0;
      }

      .container {
        display: table;

        width: 100%;
        height: 200px;

        outline: 1px solid blue;
      }

      .box {
        height: 200px;
      }

      .left {
        display: table-cell;

        width: 100px;

        background-color: red;
      }

      .center {
        display: table-cell;

        background-color: blue;
      }

      .right {
        display: table-cell;

        width: 200px;

        background-color: green;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="box left">left</div>
      <div class="box center">center</div>
      <div class="box right">right</div>
    </div>
  </body>
</html>
```

6. flex布局

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      body {
        margin: 0;
        padding: 0;
      }

      .container {
        display: flex;

        height: 200px;

        outline: 1px solid blue;
      }

      .box {
        height: 200px;
      }

      .left {
        width: 100px;

        background-color: red;
      }

      .center {
        flex-grow: 1;

        background-color: blue;
      }

      .right {
        width: 200px;

        background-color: green;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="box left">left</div>
      <div class="box center">center</div>
      <div class="box right">right</div>
    </div>
  </body>
</html>
```

6. 绝对定位

需要注意的点: **子绝父相**, container元素要设置position: relative, left和right要设置top: 0

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      body {
        margin: 0;
        padding: 0;
      }

      .container {
        position: relative;

        height: 200px;

        outline: 1px solid blue;
      }

      .box {
        height: 200px;
      }

      .left {
        position: absolute;
        top: 0;
        left: 0;

        width: 100px;

        background-color: red;
      }

      .center {
        margin: 0 200px 0 100px;

        background-color: blue;
      }

      .right {
        position: absolute;
        top: 0;
        right: 0;

        width: 200px;

        background-color: green;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="box left">left</div>
      <div class="box center">center</div>
      <div class="box right">right</div>
    </div>
  </body>
</html>
```


## 水平居中的实现

1. 子元素定宽
   1. `margin: 0 auto`
2. 子元素不定宽
   1. `position: absolute; left: 50%; transform: translateX(-50%)`
   2. 左右相同的margin
   3. 父元素flex布局, `justify-content: center`
   4. 父元素左右相等的内边距

## 垂直居中的实现

1. 子元素定高
    1. `margin: auto 0`
2. 子元素不定高
   1. `position: absolute; top: 50%; transform: translateY(-50%)`
   2. 上下相同的margin
   3. 父元素flex布局, `align-items: center`
   4. 父元素上下相等的内边距
## 如何根据设计稿进行移动端适配

首先通过meta标签配置视口
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

然后进行媒体查询

```html
<link rel="style-sheet" href="style.css" media="screen and (max-width: 1000px)">
```

或者
```html
<style>
    @media only screen and (max-width: 1000px) {

    }
</style>
```

## 对flex布局的理解及其应用

flex布局也称作为弹性布局, 定义了display: flex的元素称作为弹性容器元素, 容器中的子元素按照弹性格式化上下文的布局规则进行排列, 子元素的float, clear, vertical-align属性将失效. flex容器当中默认有两个轴: 主轴和辅轴, 容器当中的子元素称作为flex-item(项目), 子元素默认沿着主轴水平排列.

父元素

- flex-direction: 主轴的方向
- flex-wrap: 子元素总宽度超过容器宽度时, 是否换行
- flex-flow: flex-direction flex-wrap的简写
- justify-content: 主轴对齐
- align-items: 辅轴对齐
- align-content: 多行对齐

子元素

- flex-grow: 0, 占据容器剩余空间的比例
- flex-shink: 1, 子元素总宽度超过容器时, 收缩的比例
- flex-basis: auto, 基本宽度, 不为auto时会覆盖width
- flex: flex-grow flex-shrink flex-basis
- order: 0, 排列顺序
- align-self: 单独指定的子元素在辅轴上的对齐方式


## 响应式布局的概念