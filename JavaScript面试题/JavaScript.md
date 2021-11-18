# JavaScript

## 对象创建的方式有哪些?

1. new + 构造函数
2. new + class
3. 通过对象字面量语法创建

## 对象继承的方式有哪些?

1. 原型链继承
    原型链继承示例
    ```js
        function Super() {
            this.name = "super"
            this.age = 10
        }

        Super.prototype.sayName = function () {
            console.log(this.name)
        }

        function Sub() {
            this.message = "Sub"
        }

        Sub.prototype = new Super()
        Sub.prototype.sendMessage = function () {
            console.log(this.message)
        }
    ```
    **缺点**
    - Sub的所有的实例对象共享一个对象, 而且这个对象是它们的父类. 这样会造成冲突. 比如
        ```js
        let a = new Sub() 
        a.name = "Jack" // 会将原型对象, 即父类实例的name属性值修改为Jack
        let b = new Sub()
        console.log(b.name) // "Jack"
        // 这里出现了冲突, 按理来说, 我们的需求是对象b会继承父类的name属性, 且继承的属性值为"Super"
        // 不管哪次新建一个子类对象都是如此. 我们要的是父类**最初的那个值**,而不是可能被修改后的值
        ```
    - 由于子类的原型对象被写死了, 所以在实例化子类的时候, 无法给父类传递参数
2. 盗用构造函数
    盗用构造函数的目的呢, 就是使某个构造函数被new调用的时候, 能够复制被盗用的构造函数的代码逻辑, 给新建的对象添加属性.
    盗用构造函数时, 不会给另一个构造函数的对象添加原型方法, 而是直接在该构造函数当中指定
    示例
    ```js
        function Super(name) {
            this.name = name
        }

        Super.prototype.sayName = function () {
            console.log(this.name)
        }

        function Sub() {
            Super.call(this, name)

            this.message = "Sub"
            this.sayMessage = function () {
                console.log(this.message)
            }
        }
    ```
    优点: 可以指定父类构造函数的参数, 解决了原型链方式的第一个缺点
    缺点: 
    - 子类对象的方法都是在构造函数当中指定的, 没有办法复用, 因为每实例化一个子类对象都会创建方法, 耗时耗内存
    - 由于父类的原型对象并不在子类对象的原型链上, 所以通过instanceof判定子类是否为父类构造函数的实例的时候, 返回false
3. 组合继承
    组合继承则是保留盗用构造函数的优点, 基于原型链继承方式去解决盗用构造函数的缺点, 即将子类的方法放在原型对象上, 而不是放在构造函数当中.
    并将父类的实例对象作为子类构造函数的原型对象

    组合继承示例
    ```js
        function Super(name) {
            this.name = name
        }

        Super.prototype.sayName = function () {
            console.log(this.name)
        }

        function Sub() {
            Super.call(this, name)

            this.message = "Sub"
        }

        Sub.prototype = new Super()
        Sub.prototype.sayMessage = function () {
            console.log(this.message)
        }
    ```
    优点: 
    - 可以给父类构造函数传递参数, 解决了原型链继承方式的第1个缺点; 
    - 子类有原型对象, 子类方法放在原型对象上, 所以子类构造函数可以复用, 解决了盗用构造函数的第1个缺点; 
    - 父类的原型对象位于子类的原型链上, 所以 子类实例instanceof父类构造函数 会返回true, 解决了盗用构造函数的第2个缺点;
    - 子类实例会拥有父类实例同名的属性, 根据"遮蔽效应", 修改子类的属性, 不会修改其原型上面的对应属性值, 所以每一个子类实例都能正确继承父类的属性值

    缺点: 父类构造函数会被调用两次, 同时, 子类的原型对象上多了一些没有必要的属性
4. 原型继承
   原型继承是一种简单的继承方式, 直接新创建一个对象, 然后要继承的对象作为该新建对象的原型对象. 

    原型继承示例
    ```js
    function createObject(target) {
        function F() {}
        let o  = new F()
        Object.setPrototypeOf(o, target)
        return o
    }
    ```
5. 寄生式继承
    寄生式继承就是在原型继承的基础上, 再给新创建的对象添加属性或者方法
    
    寄生式继承示例
    ```js
        function extend(target) {
            let obj = createObject(target)
            obj.sayHello = function () {
                console.log("hello")
            }
            return obj
        }
    ```
6. 寄生式组合继承

    寄生式组合继承是基于由原型继承演化而来的寄生式继承对组合继承的唯一缺点的改进:  用简单的`new F()`新建的对象作为子类的原型对象, 并添加原型方法, 这样父类的构造函数只用调用一次, 同时子类原型对象上没有多余的属性. 
    
    寄生式组合示例
    ```js
    function Super(name) {
        this.name = name
    }

    Super.prototype.sayName = function () {
        console.log(this.name)
    }

    function Sub() {
        Super.call(this, name)

        this.message = "Sub"
    }

    function extend(target) {
        let obj = createObject(target)
        obj.sayHello = function () {
            console.log("hello")
        }
        obj.sayMessage = function () {
            console.log(this.message)
        }
        // ... 其他的一些子类原型方法
        return obj
    }

    Sub.prototype = extend(Super.prototype)
    ```