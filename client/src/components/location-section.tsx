import { MapPin, Navigation, Car, Bus, Bike, TrainFront, Shield, Ban, IdCard, CloudRain, Smartphone } from "lucide-react";

export default function LocationSection() {
  const openDirections = () => {
    const address = "Shotz, Flic en Flac, Mauritius";
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  };

  return (
    <section id="location" className="py-20 bg-gradient-to-tr from-background via-card to-background relative">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-32 right-20 w-80 h-80 bg-primary rounded-full blur-3xl"></div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold gradient-text mb-6" data-testid="location-title">
            EVENT LOCATION & INFO
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="location-description">
            Everything you need to know for an amazing experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center" data-testid="venue-details-title">
              <MapPin className="gradient-text mr-3" />
              Venue Details
            </h3>
            
            <div className="space-y-6">
              <div className="bg-muted rounded-xl p-6" data-testid="venue-info-card">
                <h4 className="font-bold text-foreground mb-2" data-testid="venue-name">Shotz</h4>
                <p className="text-muted-foreground mb-4" data-testid="venue-address">
                  Flic en Flac<br />
                  Mauritius
                </p>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={openDirections}
                    className="text-accent hover:text-accent/80 flex items-center"
                    data-testid="directions-button"
                  >
                    <Navigation className="mr-2" />
                    Get Directions
                  </button>
                  <button className="text-accent hover:text-accent/80 flex items-center" data-testid="parking-info-button">
                    <Car className="mr-2" />
                    Parking Info
                  </button>
                </div>
              </div>
              
              <div className="bg-muted rounded-xl p-6" data-testid="transportation-card">
                <h4 className="font-bold text-foreground mb-4" data-testid="transportation-title">Getting There</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center space-x-3" data-testid="transport-taxi">
                    <Car className="text-accent" />
                    <span>Taxi or ride-sharing services</span>
                  </li>
                  <li className="flex items-center space-x-3" data-testid="transport-bus">
                    <Bus className="text-accent" />
                    <span>Public bus to Flic en Flac</span>
                  </li>
                  <li className="flex items-center space-x-3" data-testid="transport-parking">
                    <Car className="text-accent" />
                    <span>Parking available at venue</span>
                  </li>
                  <li className="flex items-center space-x-3" data-testid="transport-walking">
                    <Navigation className="text-accent" />
                    <span>Walking distance from beach area</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <img 
              src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Aerial view of outdoor concert venue with stages and crowd areas" 
              className="w-full h-96 object-cover rounded-2xl shadow-lg mb-8"
              data-testid="venue-aerial-image"
            />
            
            <div className="bg-muted rounded-xl p-6" data-testid="important-info-card">
              <h4 className="font-bold text-foreground mb-4" data-testid="important-info-title">Important Information</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start space-x-3" data-testid="info-id-required">
                  <IdCard className="text-accent mt-1" />
                  <span>Valid ID required for entry (18+ event)</span>
                </li>
                <li className="flex items-start space-x-3" data-testid="info-no-outside">
                  <Ban className="text-accent mt-1" />
                  <span>No outside drinks or food allowed</span>
                </li>
                <li className="flex items-start space-x-3" data-testid="info-security">
                  <Shield className="text-accent mt-1" />
                  <span>Security checks at entrance</span>
                </li>
                <li className="flex items-start space-x-3" data-testid="info-weather">
                  <CloudRain className="text-accent mt-1" />
                  <span>Event continues rain or shine</span>
                </li>
                <li className="flex items-start space-x-3" data-testid="info-digital-tickets">
                  <Smartphone className="text-accent mt-1" />
                  <span>Digital tickets must be shown on mobile device</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
