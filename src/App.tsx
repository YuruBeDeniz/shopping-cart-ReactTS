import { useState } from 'react';
import { useQuery } from 'react-query';
//components
import Item from './Item/Item';
import Cart from './Cart/Cart';
import Drawer from '@material-ui/core/Drawer';
import { LinearProgress } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import Badge from '@material-ui/core/Badge';
//styles
import { Wrapper, StyledButton } from './App.styles';


//types
export type CartItemType = {
  id: number;
  category: string;
  description: string;
  image: string;
  price: number;
  title: string;
  amount: number;
}

const getProducts = async (): Promise<CartItemType[]> => {
  return await (await fetch('https://fakestoreapi.com/products')).json();
}


function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([] as CartItemType[]);

  const { data, isLoading, error } = useQuery(
    'products',
    getProducts
    );

  console.log(data); 
  
  const getTotalItems = (items: CartItemType[]) => 
     items.reduce((acc: number, item) => acc + item.amount, 0);

  const handleAddToCart = (clickedItem: CartItemType) => {
    setCartItems(prev => {
      //1. is the item already added in cart
      const isItemInCart = prev.find(item => item.id === clickedItem.id);
      //eğer aynı ürünse sadece miktarı arttırıyoruz, yeni ürünse item ı object olarak ekliyoruz:
      if(isItemInCart) {
        return prev.map(item => (
           item.id === clickedItem.id 
           ? { ...item, amount: item.amount + 1}
           : item
        ))
      } 
      //first time the item is added
      return [...prev, { ...clickedItem, amount: 1}];
    });

  };

  const handleRemoveFromCart = (id: number) => {
    setCartItems(prev =>
      prev.reduce((acc, item) => {
        
        if (item.id === id) {
          if (item.amount === 1) return acc;
          return [...acc, { ...item, amount: item.amount - 1 }];
        } else {
          console.log('accumulator: ', acc)
          return [...acc, item];
        }
      }, [] as CartItemType[])
    );
  };
  //we have to specify the initial value for the reduce: [] as CartItemType[])
  //if the amount is 1 and if we click remove button it should disappear from the array: return acc;
  //we only return the accumulator and skip the item (this will delete the item from the array)
  //otherwise we reduce 1 from the amount for each click
  //if we are not on the item that we clicked on we have the else statement:
  //we'll return an array, we spread out the acc and return the item as it is

  if(isLoading) return <LinearProgress />;
  if(error) return <div>Something went wrong...</div>

  return (
    <Wrapper>
      <Drawer anchor='right' open={isCartOpen} onClose={() => setIsCartOpen(false)} >
        <Cart   
          cartItems={cartItems}
          addToCart={handleAddToCart}
          removeFromCart={handleRemoveFromCart} />
      </Drawer>
      <StyledButton onClick={() => setIsCartOpen(true)}>
        <Badge badgeContent={getTotalItems(cartItems)} color="error">
          <AddShoppingCartIcon />
        </Badge>
      </StyledButton>


      <Grid container spacing={3}>
        {data?.map(item => (
          <Grid item key={item.id} xs={12} sm={4}>
            <Item item={item} handleAddToCart={handleAddToCart} />
          </Grid>
        ))}
      </Grid>
    </Wrapper>
  );
}

export default App;
