type ArgData = number
enum SideEnum {
  LEFT = 'left',
  RIGHT = 'right',
}
type Side = SideEnum.LEFT | SideEnum.RIGHT
type OrderType = 'in' | 'pre' | 'post'
class NodeItem {

  data: ArgData
  left?: NodeItem
  right?: NodeItem

  constructor (data: ArgData) {
    this.data = data
  }
}

class BinarySearchTree {

  root?: NodeItem

  constructor () {

  }

  insert (data:  ArgData) {
    const newNode = new NodeItem(data)

    if (!this.root) {
      this.root = newNode
    }
    else {
      this.insertNode(this.root, newNode)
    }
    return this
  }

  insertNode (node: NodeItem, newNode: NodeItem) {
    const isNewNodeValueSmaller = newNode.data < node.data
    const isSame = newNode.data === node.data

    if (isSame) return undefined;

    if (isNewNodeValueSmaller) {
      if (!node.left) {
        node.left = newNode
      }
      else {
        this.insertNode(node.left, newNode)
      }
    }

    if (!isNewNodeValueSmaller) {
      if (!node.right) {
        node.right = newNode
      }
      else {
        this.insertNode(node.right, newNode)
      }
    }

  }

  find (value: ArgData): null | NodeItem {
    let current = this.root

    while (current) {
      if (current.data === value) return current
      if (value < current.data) {
        current = current.left
      }
      else {
        current = current.right
      }
    }

    return null
  }

  remove (value: ArgData) {
    this.removeNode({value, node: this.root})
  }

  removeNode ({
    value, node, parentNode, whichSide,
  }: {
    value: ArgData,
    node?: NodeItem,
    parentNode?: NodeItem,
    whichSide?: Side,
  }) {
    let foundValueWithNode: NodeItem | undefined

    if (node) {
      if (node.data === value) {
        foundValueWithNode = node
      }

      if (!foundValueWithNode) {
        const side = value < node.data ? SideEnum.LEFT : SideEnum.RIGHT
        this.removeNode({
          value, node: node[side],
          parentNode: node,
          whichSide: side,
        })
      }
    }
    // console.log(`************************ `, foundValueWithNode, whichSide, parentNode)

    if (foundValueWithNode) {
      const noSubNodes = foundValueWithNode.left === undefined && foundValueWithNode.right === undefined
      const onlyOneSubNode = !noSubNodes && (foundValueWithNode.left === undefined || foundValueWithNode.right === undefined)
      const gotBothSubNodes = foundValueWithNode.left !== undefined && foundValueWithNode.right !== undefined

      console.log(`foundValueWithNode `, foundValueWithNode, `\n`, noSubNodes, onlyOneSubNode, gotBothSubNodes)

      if (noSubNodes) {
        parentNode && whichSide ? delete parentNode[whichSide] : (this.root = undefined)

      }

      if (onlyOneSubNode) {
        const uNode = node?.left || node?.right
        if (parentNode && whichSide) {
          parentNode[whichSide] = uNode
        }
        else {
          this.root = uNode
        }
      }

      if (gotBothSubNodes) {
        const leftValue = foundValueWithNode.left?.data
        const rightValue = foundValueWithNode.right?.data
        // const oppositeSide = whichSide === SideEnum.LEFT ? SideEnum.RIGHT : SideEnum.LEFT
        // const parentNodeValue = parentNode?.data
        // const oppositeSideValue = parentNode ? parentNode[oppositeSide]?.data : undefined
        // console.log(`gotBothSubNodes leftValue ${leftValue} rightValue ${rightValue} parentNodeValue ${parentNodeValue} oppositeSideValue ${oppositeSideValue}\n`,)

        const leafNodes = this.findAllTheLeafNodes(foundValueWithNode).leafNodes

        const minValue = leftValue || 0
        const maxValue = rightValue || 0
        const findValueBetweenMinAndMax = leafNodes.find(aItem => aItem.node.data > minValue && aItem.node.data < maxValue)
        console.log(`findValueBetweenMinAndMax ${minValue}<VALUE<${maxValue} `, findValueBetweenMinAndMax?.node)

        if (findValueBetweenMinAndMax) {
          const nData = findValueBetweenMinAndMax.node.data
          this.removeNode({
            value: nData,
            node: foundValueWithNode,
          })
          foundValueWithNode.data = nData
        }
        else {
          const useSide = foundValueWithNode.left ? SideEnum.LEFT : SideEnum.RIGHT
          const cloneNode = JSON.parse(JSON.stringify( foundValueWithNode.left || foundValueWithNode.right))
          delete foundValueWithNode[useSide]
          Object.assign(foundValueWithNode, cloneNode)

        }
      }
    }
  }

  findDeepestNodeBySide (node?: NodeItem, side?: Side) {
    const tSide = side || 'left'
    let tNode = node

    while (tNode && tNode[tSide]) {
      tNode = tNode[tSide]
    }
    return tNode
  }

  findAllTheLeafNodes (node?: NodeItem) {
    const leafNodes: {node: NodeItem, depth: number}[] = []

    const toFind = (fNode?: NodeItem, depth?: number): void => {
      const tDepth = depth || 1
      if (fNode) {
        if (fNode.left) {
          toFind(fNode.left, tDepth+1)
        }

        if (fNode.right) {
          toFind(fNode.right, tDepth+1)
        }

        if (!fNode.left && !fNode.right) {
          leafNodes.push({node: fNode, depth: tDepth})
        }
      }
    }
    toFind(node)

    leafNodes.sort((a, b) => {
      if (a.depth > b.depth) return -1
      return 1
    })
    const res = {
      leafNodes,
      countLeaves: leafNodes.length,
      maxDepth: leafNodes[0]?.depth,
    }
    return res
  }

  getOrder ({
    orderType,
    fnType = 'iterative',
  }: {
    orderType: OrderType
    fnType?: 'recursive' | 'iterative'
  }) {
    const res: ArgData[] = []
    const isPre = orderType === 'pre'
    const isIn = orderType === 'in'
    const isPost = orderType === 'post'
    const isRecursive = fnType === 'recursive'

    const recursiveFn = (node?: NodeItem) => {
      const pushLeft = () => node?.left && recursiveFn(node.left)
      const pushData = () => node && res.push(node.data)
      const pushRight = () => node?.right && recursiveFn(node.right)

      if (isPre) {
        pushData()
        pushLeft()
        pushRight()
      }

      if (isIn) {
        pushLeft()
        pushData()
        pushRight()
      }

      if (isPost) {
        pushLeft()
        pushRight()
        pushData()
      }

    }
    const iterativeFn = () => {
      if (isPre) {
        const list = [this.root]
        while (list.length) {
          const node = list.pop()
          node && res.push(node.data)
          node?.right && list.push(node.right)
          node?.left && list.push(node.left)
        }
      }

      if (isIn) {
        const list: NodeItem[] = []
        let rNode = this.root
        while (rNode || list.length) {
          while (rNode) {
            list.push(rNode)
            rNode = rNode.left
          }
          rNode = list.pop()
          rNode && res.push(rNode.data)
          rNode = rNode?.right
        }
      }

      if (isPost) {
        const list = [this.root]
        while (list.length) {
          const node = list.pop()
          node && res.unshift(node.data)
          node?.left && list.push(node.left)
          node?.right && list.push(node.right)
        }
      }
    }

    isRecursive ? recursiveFn(this.root) : iterativeFn()
    return res
  }
}

(() => {
  const bst = new BinarySearchTree()
  bst
    .insert(16)
    .insert(18)
    .insert(17)
    .insert(9)
    .insert(10)
    .insert(8)
    .insert(13)
    .insert(6)
    .insert(7)
    // .insert(13)
    // .insert(15)
    // .insert(14)
    // .insert(5)
    // .insert(4)
    // .insert(19)
    // .insert(18)
  console.dir(bst.root, {depth: null, colors: true})
  // bst.remove(11)
  console.dir(bst.root, {depth: null, colors: true})
  // console.dir(bst.find(10), {depth: null, colors: true})
  console.info(bst.getOrder({
    orderType: 'post',
    fnType: 'iterative',
  }))
})()
