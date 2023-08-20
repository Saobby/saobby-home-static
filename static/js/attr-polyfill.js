/**
 * @description CSS attr()方法的支持和使用
 * @author zhangxinxu(.com) 2020-08-11
 * @docs https://www.zhangxinxu.com/wordpress/?p=9443
 * @license MIT 作者和出处保留
 */

(function () {
    if (!window.CSS) {
        return;
    }

    if (CSS.supports('color: attr(color color)')) {
        return;
    }


    if (!NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
    }

    // 观察的元素选择器
    var watchSelector = window.watchSelector || '*';

    // 获取页面中所有的CSS自定义属性
    var isSameDomain = function (styleSheet) {
        if (!styleSheet.href) {
            return true;
        }

        return styleSheet.href.indexOf(window.location.origin) === 0;
    };

    var isStyleRule = function (rule) {
        return rule.type === 1;
    };

    var arrCSSCustomProps = (function () {
        return [].slice.call(document.styleSheets).filter(isSameDomain).reduce(function (finalArr, sheet) {
            return finalArr.concat([].slice.call(sheet.cssRules).filter(isStyleRule).reduce(function (propValArr, rule) {
                var props = [].slice.call(rule.style).map(function (propName) {
                    return [
                        propName.trim(),
                        rule.style.getPropertyValue(propName).trim()
                    ];
                }).filter(function ([propName]) {
                    return propName.indexOf('--') === 0;
                });

                return [].concat(propValArr, props);
            }, []));
        }, []);
    })();

    // 使用了keyword()语法的CSS自定义属性名
    var arrCssPropsValueIsAttr = arrCSSCustomProps.filter(function (arrPropVal) {
        return /attr\([\w\W]+\)/i.test(arrPropVal[1]);
    });

    // attr()语法的解析
    // 返回对应的<attr-name> <type-or-unit> 和 <attr-fallback>
    var funParseAttr = function (valueVar) {
        var attrName, typeOrUnit, attrFallback;
        if (valueVar) {

            valueVar = valueVar.replace(/attr\(([\w\W]*)\)/i, '$1');
            // fallback获取
            var arrValueVar = valueVar.split(',');
            // 这是后备样式，如果没有对应的属性，则使用这个值
            if (arrValueVar.length > 1) {
                attrFallback = arrValueVar[1].trim();
            }

            // 前面的属性和单位
            var arrFirstPart = arrValueVar[0].trim().split(/\s+/);
            attrName = arrFirstPart[0];
            typeOrUnit = arrFirstPart[1] || 'string';
        }

        return {
            attrName: attrName,
            typeOrUnit: typeOrUnit,
            attrFallback: attrFallback
        };
    };

    // attr()语法转换成目前CSS变量可识别的语法
    var funAttrVar2NormalVar = function (objParseAttr, valueAttr) {
        // attr()语法 attr( <attr-name> <type-or-unit>? [, <attr-fallback> ]? )
        // valueVar示意：attr(bgcolor color, deeppink)
        // valueAttr示意： 'deepskyblue'或者null

        var attrName = objParseAttr.attrName;
        var typeOrUnit = objParseAttr.typeOrUnit;

        // typeOrUnit值包括：
        // string | color | url | integer | number | length | angle | time | frequency | cap | ch | em | ex | ic | lh | rlh | rem | vb | vi | vw | vh | vmin | vmax | mm | Q | cm | in | pt | pc | px | deg | grad | rad | turn | ms | s | Hz | kHz | %

        var arrUnits = ['ch', 'em', 'ex', 'ic', 'lh', 'rlh', 'rem', 'vb', 'vi', 'vw', 'vh', 'vmin', 'vmax', 'mm', 'cm', 'in', 'pt', 'pc', 'px', 'deg', 'grad', 'rad', 'turn', 'ms', 's', 'Hz', 'kHz', '%'];

        var valueVarNormal = valueAttr;
        // 如果是string类型
        switch (typeOrUnit) {
            case 'string': {
                valueVarNormal = '"' + valueAttr + '"';
                break;
            }
            case 'url': {
                if (/^url\(/i.test(valueAttr) == false) {
                    valueVarNormal = 'url(' + valueAttr + ')';
                }
                break;
            }
        }

        // 数值变单位的处理
        if (arrUnits.includes(typeOrUnit) && valueAttr.indexOf(typeOrUnit) == -1 && parseFloat(valueAttr) == valueAttr) {
            valueVarNormal = parseFloat(valueAttr) + typeOrUnit;
        }

        return valueVarNormal;
    };

    // 设置自定义属性值的方法
    var funSetAttr = function (node) {
        if (node.nodeType != 1 || node.matches(watchSelector) == false) {
            return;
        }

        // 通配符匹配时候有些元素忽略
        if (watchSelector == '*' && ['script', 'style', 'meta', 'title', 'head'].includes(node.nodeName.toLowerCase())) {
            return;
        }

        var objStyle = window.getComputedStyle(node);

        // 当前节点的所有样式对象
        var objStyle = window.getComputedStyle(node);

        // 所有设置了keyword()的自定义属性的遍历处理
        arrCssPropsValueIsAttr.forEach(function (arr) {
            var cssProp = arr[0];
            var cssValue = node['originCssValue' + cssProp] || arr[1];

            // 判断当前节点有没有设置对应的自定义属性
            var cssVarValueAttr = objStyle.getPropertyValue(cssProp);

            if (!cssVarValueAttr || !cssVarValueAttr.trim() || (!/attr\(([\w\W]*)\)/i.test(cssVarValueAttr) && !node['originCssValue' + cssProp])) {
                return;
            }

            // 这个是HTML属性改变时候用的
            if (!node['originCssValue' + cssProp]) {
                node['originCssValue' + cssProp] = cssValue;
            }            

            // 总是使用初始获取的自定义属性值
            cssVarValueAttr = cssValue;

            var objParseAttr = funParseAttr(cssVarValueAttr);

            // 获取属性对应的值
            if (!objParseAttr.attrName) {
                return;
            }

            // attr()属性名
            var attrName = objParseAttr.attrName;

            // 获取此时节点这些属性目前对应的值
            // 如果没有值，则使用后备值
            var strHtmlAttr = node.getAttribute(attrName) || objParseAttr.attrFallback;
            if (!strHtmlAttr) {
                // 设置为空
                node.style.setProperty(cssProp, '');
                return;
            }

            // 标记需要观察的HTML属性
            node.attrNeedWatch = node.attrNeedWatch || [];
            if (node.attrNeedWatch.includes(attrName) == false) {
                node.attrNeedWatch.push(attrName);
            }

            // 核心方法
            // 浏览器不支持的attr()语法转变成支持的语法
            var valueVarNormal = funAttrVar2NormalVar(objParseAttr, strHtmlAttr);

            console.log(valueVarNormal);
            // 设置
            node.style.setProperty(cssProp, valueVarNormal);
        });
    };


    var funAutoInitAndWatching = function () {
        // DOM Insert自动初始化
        if (window.MutationObserver) {
            var observerSelect = new MutationObserver(function (mutationsList) {
                mutationsList.forEach(function (mutation) {
                    var nodeAdded = mutation.addedNodes;
                    // 新增元素
                    nodeAdded.forEach(function (eleAdd) {
                        funSetAttr(eleAdd);
                    });
                    // 如果是属性发生变化
                    var attributeName = mutation.attributeName;

                    if (mutation.target && mutation.target.attrNeedWatch && mutation.target.attrNeedWatch.includes(attributeName)) {
                        funSetAttr(mutation.target);
                    }
                });
            });

            observerSelect.observe(document.body, {
                childList: true,
                attributes: true,
                subtree: true
            });
        }

        // 如果没有开启自动初始化，则返回
        document.querySelectorAll(watchSelector).forEach(function (ele) {
            funSetAttr(ele);
        });
    };

    if (document.readyState != 'loading') {
        funAutoInitAndWatching();
    } else {
        window.addEventListener('DOMContentLoaded', funAutoInitAndWatching);
    }
})();
