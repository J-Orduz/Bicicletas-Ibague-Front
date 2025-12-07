import { useState, useEffect } from "react";
import { MapView } from "@pages/map/MapView";
import { MapSidebar } from "@pages/map/MapSidebar";
import { SubHeader } from "@layouts/SubHeader";
import { useGetCurrentReservation } from "@api/reserves";
import "./Home.scss";

export const Home = () => {
  const [currentReservation, setCurrentReservation] = useState(null);
  const [bikeStations, setBikeStations] = useState([]);
  const [bikeTelemetry, setBikeTelemetry] = useState(null);

  const getCurrentReservation = useGetCurrentReservation();

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const reservation = await getCurrentReservation.get();
        if (reservation.data) {
          setCurrentReservation(reservation.data);
        }
      } catch (error) {
        console.error("Error al obtener reserva:", error);
      }
    };

    fetchReservation();
  }, []);

  const handleStationsLoaded = (stations) => {
    setBikeStations(stations);
  };

  const handleBikeTelemetryUpdate = (telemetry) => {
    setBikeTelemetry(telemetry);
  };

  return (
    <section className="home-container">
      <SubHeader pageTitle="Mapa BicIbagué" />
      <div className="home-content">
        <MapView 
          onStationsLoaded={handleStationsLoaded}
          onBikeTelemetryUpdate={handleBikeTelemetryUpdate}
        />
        <MapSidebar
          currentReservation={currentReservation}
          bikeStations={bikeStations}
          bikeTelemetry={bikeTelemetry}
        />
      </div>
    </section>
  );
};
