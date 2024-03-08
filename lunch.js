// ==UserScript==
// @name         Lunch
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  try to take over the world!
// @author       You
// @match        /^[^:/#?]*:\/\/([^#?/]*\.)?eats\.quickclick\.cc(:[0-9]{1,5})?\/.*$/
// @match        /^[^:/#?]*:\/\/([^#?/]*\.)?order\.ocard\.co\/simplycarbs\/order(:[0-9]{1,5})?\/.*$/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=microsoft.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/hsuan9522/Tampermonkey-Script/master/lunch.js
// ==/UserScript==

;(function () {
    'use strict'

    // Your code here...
    if (location.href.match(/https:\/\/order\.ocard\.co\//g)) {
        window.hs = async function () {
            const order_id = location.href.replace('https://order.ocard.co/simplycarbs/order/', '')

            const formData = new FormData()
            formData.append('brand_id', 'simplycarbs')
            formData.append('order_id', order_id)

            const res = await fetch('https://api-order.ocard.co/order/get', {
                method: 'POST',
                body: formData,
            })
                .then(res => {
                    return res.json()
                })
                .catch(err => {
                    console.log('err', err)
                })

            let total = Object.create(null)

            const ans = res.data.group.orders.reduce((arr, cur) => {
                const user = cur.name
                cur.items.forEach(e => {
                    let name = `${e.category_name}_${e.name}`
                    if (e.adds.length >= 1) {
                        name += '('
                        e.adds.forEach(el => {
                            name += el.name
                        })
                        name += ')'
                    }
                    if (!arr[name]) {
                        arr[name] = []
                    }
                    arr[name].push(user)

                    if (total[e.category_name]) {
                        total[e.category_name]++
                    } else {
                        total[e.category_name] = 1
                    }
                })
                return arr
            }, Object.create(null))

            total['0*Price'] = res.data.group.item_subtotal
            ans['0*Total-Ocard'] = total
            console.log('-----------Ocard-----------')
            console.log(ans)
            console.log('---------------------------')
        }

        window.hs()
    } else if (location.href.match(/https:\/\/eats\.quickclick\.cc\//g)) {
        window.hs = async function () {
            const url = location.href.replace('line-orders', 'apis/orders')
            const res = await fetch(url)
                .then(res => {
                    return res.json()
                })
                .catch(err => {
                    console.log('err', err)
                })

            const ans = res.products.reduce((arr, cur) => {
                const name = cur.name.replace(/---(?:.[^\)]*)/g, '')
                if (!arr[name]) {
                    arr[name] = []
                }

                for (let i = 0; i < cur.qty; i++) {
                    arr[name].push(cur.name.match(/---((?:.[^\)]*))/g)[0].replace('---', ''))
                }

                return arr
            }, Object.create(null))

            let total = Object.create(null)
            for (let i in ans) {
                // console.log(i,x[i])
                const name = i.replace(/( - .*)/g, '')
                const count = ans[i].length
                if (!total[name]) total[name] = 0
                total[name] += count
            }
            total['0*Price'] = res.orderAmount
            ans['0*Total-作燴'] = total
            console.log('-----------作燴-----------')
            console.log(ans)
            console.log('--------------------------')
        }

        window.hs()
    }

    window.lunch = async (urls = []) => {
        // 作燴多單合併

        let res = [],
            price = 0

        let promise = []
        urls.forEach(u => {
            const url = u.replace('line-orders', 'apis/orders')
            promise.push(
                fetch(url)
                    .then(res => res.json())
                    .catch(err => console.log('err', err))
            )
        })

        try {
            const response = await Promise.all(promise)
            response.forEach(e => {
                res = res.concat(e.products)
                price += e.orderAmount
            })
        } catch (err) {
            console.log('err', err)
        }

        const ans = res.reduce((arr, cur) => {
            const name = cur.name.replace(/---(?:.[^\)]*)/g, '')
            if (!arr[name]) {
                arr[name] = []
            }

            for (let i = 0; i < cur.qty; i++) {
                arr[name].push(cur.name.match(/---((?:.[^\)]*))/g)[0].replace('---', ''))
            }

            return arr
        }, Object.create(null))

        let total = Object.create(null)
        for (let i in ans) {
            // console.log(i,x[i])
            const name = i.replace(/( - .*)/g, '')
            const count = ans[i].length
            if (!total[name]) total[name] = 0
            total[name] += count
        }

        total['0*Price'] = price
        ans['0*Total-作燴'] = total

        console.log('-----------作燴-----------')
        console.log(ans)
        console.log('--------------------------')
    }
})()
