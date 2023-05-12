import React, { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { FaDotCircle } from "react-icons/fa";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { FaMapMarkerAlt } from "react-icons/fa";
import Spinner from "./Spinner";

import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";

//Styles for Google Map Component
const containerStyle = {
  width: "100%",
  height: "520px",
};

//Default Co-ordinates for Google Map
const indiaCoords = {
  lat: 20.5937,
  lng: 78.9629,
};

//Libary array for useJsApiLoader
const libraries = ["places"];

//Function to extract first place from google suggested location
const getFirstName = (locationString) => {
  const locationArray = locationString.split(",");
  return locationArray[0].trim();
};

const Main = () => {
  //For origin, destination, stop inputs
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [stops, setStops] = useState([]);

  //For Direction which contains info like distance between origin and destination.
  const [directions, setDirections] = useState(null);

  //For Auto Complete Component
  const [originSearchResult, setOriginSearchResult] = useState(null);
  const [destinationSearchResult, setDestinationSearchResult] = useState(null);
  const [stopSearchResult, setStopSearchResult] = useState(null);

  //For Multiple Stops Inputs
  const [stopInputs, setStopInputs] = useState([{}]);

  //For Logic if input is cleared by the user
  const [isClearing, setIsClearing] = useState(false);

  //State to show the map
  const [showMap, setShowMap] = useState(false);

  //Initializing Google Maps using useJsApiLoader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_MAP_API_KEY,
    libraries,
  });

  //Direction Call back function for Google Map Component to get directions details
  const directionsCallback = (response) => {
    if (response !== null) {
      setDirections(response);
    }
  };

  //OnLoad Call back function for Google Map Component
  const onLoad = (map) => {
    if (isLoaded) {
      const directionsRenderer = new google.maps.DirectionsRenderer();
      directionsRenderer.setMap(map);
    }
  };

  //Function to handle Change in Origin
  const handleOriginChange = () => {
    setShowMap(false);
    const orignPlace = originSearchResult.getPlace();
    setOrigin({
      name: orignPlace.formatted_address,
      lat: orignPlace.geometry.location.lat(),
      lng: orignPlace.geometry.location.lng(),
    });
  };

  //Function to to handle Change in Destination
  const handleDestinationChange = () => {
    setShowMap(false);
    const destinationPlace = destinationSearchResult.getPlace();
    setDestination({
      name: destinationPlace.formatted_address,
      lat: destinationPlace.geometry.location.lat(),
      lng: destinationPlace.geometry.location.lng(),
    });
  };

  //Function to to handle Change in Stop
  const handleStopChange = (index) => {
    const stopPlace = stopSearchResult.getPlace();

    const newStop = {
      id: stopPlace.place_id,
      name: stopPlace.formatted_address,
      lat: stopPlace.geometry.location.lat(),
      lng: stopPlace.geometry.location.lng(),
    };
    setStops([...stops, newStop]);
  };

  //Function to add more stop inputs
  const addStopInput = () => {
    const inputStopIndex = stopInputs.length - 1;
    if (stops[inputStopIndex]) {
      setStopInputs([...stopInputs, {}]);
    }
  };

  //Function to delete the stop input
  const deleteStopInput = (id) => {
    const filterStopInputs = stopInputs.filter((stop) => stop.id !== id);
    const filterStops = stops.filter((stop) => stop.id !== id);
    setStopInputs(filterStopInputs);
    setStops(filterStops);
  };

  //It is used to sync "stops" and "stopsInputs" state arrays
  useEffect(() => {
    if (isLoaded) {
      if (stops.length === 0) {
        setStopInputs([{}]);
      } else {
        if (!isClearing) {
          setStopInputs([...stops]);
        }
      }
    }
  }, [stops]);

  //Spinner will be shown if google map is not initialized yet
  if (!isLoaded) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto md:px-5 xl:px-0">
      <p className="hidden md:block font-workSans text-[20px] my-8 leading-[24px] font-normal text-center text-[#1B31A8]">
        Let's calculate <span className="font-semibold">distance </span>from
        Google maps
      </p>

      <div className="flex flex-col-reverse gap-5 lg:gap-20 md:grid md:grid-cols-2 pb-4">
        <div className="px-3 md:px-0">
          <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-8">
            <div className="flex flex-col gap-4 md:flex-grow">
              <div>
                <label
                  htmlFor="origin"
                  className="hidden md:block mb-2 text-sm font-light"
                >
                  Origin
                </label>
                <Autocomplete
                  onLoad={(autocomplete) => setOriginSearchResult(autocomplete)}
                  onPlaceChanged={handleOriginChange}
                  className="bg-white border border-[#DCDDEC] text-sm text-[#1E2A32] rounded-lg w-full font-semibold"
                >
                  <div className="flex items-center gap-2 w-full pl-2">
                    <div className="border-2 w-[17px] h-[16px] flex justify-center items-center border-black rounded-full">
                      <div className="w-[10.35px] h-[10.35px] bg-green-400 rounded-full" />
                    </div>
                    <input
                      type="text"
                      id="origin"
                      placeholder="Mumbai"
                      required
                      className="w-full py-3.5 px-1"
                    />
                  </div>
                </Autocomplete>
              </div>

              <div className="flex flex-col gap-2">
                {stopInputs.map((stop, index) => (
                  <div key={stop.id}>
                    <label
                      htmlFor="stop"
                      className="hidden md:block mb-2 text-sm font-light"
                    >
                      Stop
                    </label>

                    <div className="flex justify-between items-center">
                      <Autocomplete
                        onLoad={(autocomplete) =>
                          setStopSearchResult(autocomplete)
                        }
                        className="bg-white border border-[#DCDDEC] text-sm text-[#1E2A32] rounded-lg w-full font-semibold"
                        onPlaceChanged={() => {
                          setShowMap(false);
                          setIsClearing(false);
                          handleStopChange(index);
                        }}
                      >
                        <div className="flex items-center gap-2 w-full pl-2">
                          <div className="w-[17px] h-[16px] flex justify-center items-center">
                            <FaDotCircle size={20} />
                          </div>
                          <input
                            type="text"
                            id="stop"
                            placeholder="Ajmer"
                            required
                            className="w-full py-3.5 px-1"
                            defaultValue={stop?.name}
                            onChange={(ev) => {
                              if (index === 0) {
                                if (ev.target.value === "") {
                                  setStops([]);
                                }
                              } else {
                                if (ev.target.value === "") {
                                  const filterStops = stops.filter(
                                    (currentStop) => currentStop.id !== stop.id
                                  );
                                  setIsClearing(true);
                                  setStops(filterStops);
                                }
                              }
                            }}
                          />
                        </div>
                      </Autocomplete>
                      {index > 0 && (
                        <AiOutlineClose
                          size={20}
                          onClick={() => deleteStopInput(stop.id)}
                        />
                      )}
                      {/* <AiOutlineClose size={25} /> */}
                    </div>
                  </div>
                ))}
                <div onClick={addStopInput} className="flex justify-end mt-2">
                  <div className="flex gap-2 items-center font-light">
                    <AiOutlinePlusCircle size={20} />
                    <p>Add another stop</p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="stop"
                  className="hidden md:block mb-2 text-sm font-light"
                >
                  Destination
                </label>

                <Autocomplete
                  onLoad={(autocomplete) =>
                    setDestinationSearchResult(autocomplete)
                  }
                  className="bg-white border border-[#DCDDEC] text-sm text-[#1E2A32] rounded-lg w-full font-semibold"
                  onPlaceChanged={handleDestinationChange}
                >
                  <div className="flex items-center gap-2 w-full pl-2">
                    <div className="w-[17px] h-[16px] flex justify-center items-center">
                      <FaMapMarkerAlt size={20} />
                    </div>
                    <input
                      type="text"
                      id="destination"
                      placeholder="Delhi"
                      required
                      className="w-full py-3.5 px-1"
                    />
                  </div>
                </Autocomplete>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                className="bg-[#1B31A8] px-10 md:px-6 py-3 my-auto rounded-[32px] text-white"
                onClick={() => setShowMap(true)}
              >
                Calculate
              </button>
            </div>
          </div>

          <div className="border rounded-lg mt-8">
            <div className="px-8 py-6 bg-white flex items-center justify-between">
              <h3 className="text-[#1E2A32] text-[20px] font-semibold leading-[24px]">
                Distance
              </h3>
              <p className="text-[#0079FF] text-[30px] leading-[36px]">
                {directions
                  ? `${directions?.routes[0].legs[0].distance.text}s`
                  : "0 Km"}
              </p>
            </div>
            {origin && destination && showMap && (
              <p className="pt-10 pb-6 bg-[#F4F8FA] px-6 text-[12px] text-start leading-[14.4px] md:text-sm">
                The distance between{" "}
                <span className="font-semibold">
                  {getFirstName(origin.name)}{" "}
                </span>{" "}
                and{" "}
                <span className="font-semibold">
                  {getFirstName(destination.name)}
                </span>{" "}
                via the seleted route is {""}
                <span className="font-semibold">
                  {directions?.routes[0].legs[0].distance.text}s
                </span>
                .
              </p>
            )}
          </div>
        </div>

        {/* Google Map Component */}
        <div className="shadow-md shadow-[#1E2A3214]">
          <GoogleMap
            apiKey={"AIzaSyAYBivEevsC3sXYWfY6n9803tvASqB0TUI"}
            onLoad={onLoad}
            mapContainerStyle={containerStyle}
            center={indiaCoords}
            zoom={10}
          >
            {isLoaded && showMap && destination && origin && (
              <DirectionsService
                options={{
                  origin: origin,
                  destination: destination,
                  waypoints: stops.map((stop) => ({ location: stop })),
                  optimizeWaypoints: true,
                  travelMode: "DRIVING",
                }}
                callback={directionsCallback}
              />
            )}
            {directions && isLoaded && (
              <DirectionsRenderer options={{ directions: directions }} />
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
};

export default Main;
