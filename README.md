# javascript-coding-challenges
### Here are my solutions for some JS challenges

#### Knapsack Problem
```js
function knapsack(items, capacity){
  const memo = [];
  const DEF_ITEM = {maxValue:0, subset:[]};

  for (let i = 0; i < items.length; i++) {
    const row = [];
    for (let cap = 1; cap <= capacity; cap++) {
      row.push(handleColValue(i,cap));
    }
    memo.push(row);
  }

  function handleColValue(row,cap){
    const col = cap - 1;
    const item = items[row];
    const restCapacity = cap - item.w;
    const prevRowIndex = row - 1
    const prevRowSameCol = row > 0 && memo[prevRowIndex][col] || DEF_ITEM;
    let newCol

    if (restCapacity >= 0) {
      const prevRowRelatedCol = row > 0 && memo[prevRowIndex][restCapacity - 1] || DEF_ITEM;
      const prevRowSameColValue = prevRowSameCol.maxValue;
      const prevRowRelatedColValue = prevRowRelatedCol.maxValue;
      const newValue = prevRowRelatedColValue + item.v;

      if (newValue >= prevRowSameColValue) {
        newCol = {
          maxValue: newValue,
          subset: [...prevRowRelatedCol.subset, item],
        }
      }
    }

    return newCol || prevRowSameCol;
  }

  return memo.pop().pop() || DEF_ITEM;
}
```
