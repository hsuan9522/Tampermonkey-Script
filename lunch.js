// ==UserScript==
// @name         Lunch
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       You
// @match        /^[^:/#?]*:\/\/([^#?/]*\.)?eats\.quickclick\.cc(:[0-9]{1,5})?\/.*$/
// @match        /^[^:/#?]*:\/\/([^#?/]*\.)?order\.ocard\.co\/simplycarbs\/order(:[0-9]{1,5})?\/.*$/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=microsoft.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    if(location.href.match(/https:\/\/order\.ocard\.co\//g)) {
        window.hs = async function() {
            const order_id = location.href.replace('https://order.ocard.co/simplycarbs/order/', '')

            const formData = new FormData()
            formData.append('brand_id', 'simplycarbs')
            formData.append('order_id', order_id)

            const res = await fetch('https://api-order.ocard.co/order/get', {
                method: 'POST',
                body: formData
            }).then(res => {
                return res.json()
            })
            .catch(err => {
                console.log('err', err)
            })

            const ans = res.data.group.orders.reduce((arr,cur) => {
                const user = cur.name
                cur.items.forEach(e => {
                    const name = e.name
                    if(!arr[name]) {
                        arr[name] = []
                    }
                    arr[name].push(user)
                })
                return arr
            }, Object.create(null))

            let total = Object.create(null);
            for(let i in ans) {
                const name = i
                const count = ans[i].length
                if(!total[name]) total[name] = 0
                total[name] += count
            }
            total['@Price'] = res.data.group.total
            ans['@Total-Ocard'] = total
            console.log('-----------Ocard-----------')
            console.log(ans)
            console.log('---------------------------')
        };

        window.hs()

    } else if(location.href.match(/https:\/\/eats\.quickclick\.cc\//g)) {
        window.hs = async function() {
            const url = location.href.replace('line-orders', 'apis/orders')
            const res = await fetch(url).then(res => {
                return res.json()
            }).catch(err => {
                console.log('err',err)
            })

            const ans = res.products.reduce((arr, cur) => {
                const name = cur.name.replace(/---(?:.[^\)]*)/g, '')
                if(!arr[name]) {
                    arr[name] = []
                }

                arr[name].push(cur.name.match(/---((?:.[^\)]*))/g)[0].replace('---', ''))
                return arr
            }, Object.create(null))

            let total = Object.create(null);
            for(let i in ans) {
                // console.log(i,x[i])
                const name = i.replace(/( - .*)/g, '')
                const count = ans[i].length
                if(!total[name]) total[name] = 0
                total[name] += count
            }
            total['@Price'] = res.orderAmount
            ans['@Total-作燴'] = total
            console.log('-----------作燴-----------')
            console.log(ans)
            console.log('--------------------------')
        };

        window.hs()
    }



    window.lunch = async (u1, u2) => {
        // 作燴兩單合併
        const url1 = u1.replace('line-orders', 'apis/orders')
        const url2 = u2.replace('line-orders', 'apis/orders')

        const res1 = await fetch(url1).then(res => {
            return res.json()
        }).catch(err => {
            console.log('err',err)
        })
        const res2 = await fetch(url2).then(res => {
            return res.json()
        }).catch(err => {
            console.log('err',err)
        })

        const res = res1.products.concat(res2.products)
        const ans = res.reduce((arr, cur) => {
            const name = cur.name.replace(/---(?:.[^\)]*)/g, '')
            if(!arr[name]) {
                arr[name] = []
            }

            arr[name].push(cur.name.match(/---((?:.[^\)]*))/g)[0].replace('---', ''))
            return arr
        }, Object.create(null))

        let total = Object.create(null);
        for(let i in ans) {
            // console.log(i,x[i])
            const name = i.replace(/( - .*)/g, '')
            const count = ans[i].length
            if(!total[name]) total[name] = 0
            total[name] += count
        }

        const price1 = res1.orderAmount
        const price2 = res2.orderAmount
        total['@Price'] = price1 + price2
        ans['@Total'] = total
        console.log('-----------作燴-----------')
        console.log(ans)
        console.log('--------------------------')
    }
    /*
    window.lunch = (res) => {
        const ans = res.reduce((arr, cur) => {
            const name = cur.name.replace(/---(?:.[^\)]*)/g, '')
            if(!arr[name]) {
                arr[name] = []
            }

            arr[name].push(cur.name.match(/---((?:.[^\)]*))/g)[0].replace('---', ''))
            return arr
        }, Object.create(null))

        let total = Object.create(null);
        for(let i in ans) {
            // console.log(i,x[i])
            const name = i.replace(/( - .*)/g, '')
            const count = ans[i].length
            if(!total[name]) total[name] = 0
            total[name] += count
        }
        ans.Total = total
        console.log(ans)

    }
    */
})();