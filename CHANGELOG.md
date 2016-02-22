# 2.0.1

 - Dependencies updated.
 - Grunt 1.0.0 support added.

# 2.0.0

- Dependencies updated. Especially lodash 4.0.0 is used now.
- New `configMergeCustomizer` added.

## Breaking Change:
- `undefined` values are removed from the merged global and target configuration. You can get back your `undefined` values by using the following code:

```js
options: {
    configMergeCustomizer: function (key, objValue, srcValue) {
        if (_.isUndefined(objValue) && _.isUndefined(srcValue)) {
            return null;
        }
    }
}
```

This will replace all `undefined` values with `null`. The signature is the same as from `_.mergeWith` with a additional first parameter `key` which can be the value `'constants'` or `'values'`. See the [_.mergeWith](https://lodash.com/docs#mergeWith) documentation for further informations.

# v1.1.0

- Template stings in the `ngconstant` configuration does now support grunts variable interpolation. [#49](https://github.com/werk85/grunt-ng-constant/pull/49)

# v1.0.0 

- More unix style. More strict and single quoted.
 
## Upgrade from v0.5.x to v1.0.0

* `js-beautify` is removed from this project (more unix style). If you need good looking code use [grunt-jsbeautifyer](https://github.com/vkadam/grunt-jsbeautifier) as additional task.
* All options for the serializers moved to the `serializerOptions` parameter.
* All output now uses single quotes as default. Thanks to [jju](https://github.com/rlidwka/jju).
* The default wrapper now includes `'use strict';`.

# v0.4.8 

- Closed [#19](https://github.com/werk85/grunt-ng-constant/issues/19)
- Closed [#23](https://github.com/werk85/grunt-ng-constant/issues/23). 
 
Thanks to [dropshare](https://github.com/dropshape) and [ggalmazor](https://github.com/ggalmazor).
 
# v0.4.7 

- Closed [#17](https://github.com/werk85/grunt-ng-constant/issues/17).
 
# v0.4.6 

- Closed [#16](https://github.com/werk85/grunt-ng-constant/issues/16). Global constants module option added to README.
 
# v0.4.5 

- Closed [#3](https://github.com/werk85/grunt-ng-constant/issues/3)
- Closed [#11](https://github.com/werk85/grunt-ng-constant/issues/11). The parameters `space`, `deps`, `wrap` and `coffee` are not available on per module base. Thanks to [jjt](https://github.com/jjt).
 
# v0.4.4 

- Closed [#10](https://github.com/werk85/grunt-ng-constant/issues/10)
 
# v0.4.3 

- Single constant option added. ejs dependency removed.
 
# v0.4.2 

- Wrap option added. Thanks to [gabrielmancini](https://github.com/gabrielmancini).
