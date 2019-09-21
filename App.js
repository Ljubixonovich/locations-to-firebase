import React, { Component } from 'react';
import { StyleSheet, Text, View, Platform, Picker } from 'react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';


export default class App extends Component {
   state = {
      location: null,
      errorMessage: null,
      measureIntervalInSeconds: 5
   };
   measureInterval;

   componentWillMount() {
      // if (Platform.OS === 'android' && !Constants.isDevice) {
      //    this.setState({
      //       errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      //    });
      // } else {
      //    this.measureInterval = setInterval(this.writeData, 1000 * 5);
      // }
      this.measureInterval = setInterval(this.writeData, 1000 * 5);
   }

   _getLocationAsync = async () => {
      let { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status !== 'granted') {
         this.setState({
            errorMessage: 'Permission to access location was denied',
         });
      }
      let location = await Location.getCurrentPositionAsync({});
      this.setState({ location });
   };

   writeData = async () => {
      await this._getLocationAsync();
      
      let {timestamp} = this.state.location;
      let {latitude, longitude} = this.state.location.coords;
      console.log(timestamp, latitude, longitude);

      // database call
      const response = await fetch('https://location-to-firebase.firebaseio.com/' + 'locations.json', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            timestamp,
            latitude,
            longitude
         })
      });
      // await response.json();
   }

   onSelectChange = (val) => {
      clearInterval(this.measureInterval);
      this.setState({measureIntervalInSeconds: val}, () => {       
         this.measureInterval = setInterval(this.writeData, 1000 * val);
      });      
   }


   render() {
      let text = 'Waiting..';
      if (this.state.errorMessage) {
         text = this.state.errorMessage;
      } else if (this.state.location) {
         text = JSON.stringify(this.state.location);
      }

      return (
         <View style={styles.container}>
            <Picker selectedValue={this.state.measureIntervalInSeconds}
               style={{height: 50, width: 150}}
               onValueChange={(itemValue) => this.onSelectChange(itemValue)}
            >
               <Picker.Item label="5 sec" value={5} />
               <Picker.Item label="30 sec" value={30} />
               <Picker.Item label="1 min" value={60} />
               <Picker.Item label="3 min" value={180} />
               <Picker.Item label="5 min" value={300} /> 
            </Picker>
            <Text style={styles.paragraph}>{text}</Text>
         </View>
      );
   }
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: Constants.statusBarHeight,
      backgroundColor: '#ecf0f1',
   },
   paragraph: {
      margin: 24,
      fontSize: 18,
      textAlign: 'center',
   },
});