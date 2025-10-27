"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Doctor type definition
interface Doctor {
  rating: string;
  user: any;
  specialization: string;
  experienceYears: string;
  id: string;
  name: string;
  specialty: string;
  experience: string;
}

const specializations = [
  "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
  "General Practice", "Hematology", "Infectious Disease", "Nephrology",
  "Neurology", "Oncology", "Pediatrics", "Psychiatry", "Pulmonology",
  "Rheumatology", "Surgery", "Urology"
];

const cities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Indore"
];

// Mock name suggestions for initial search
const nameSuggestions = [
  "Dr. Smith", "Dr. Johnson", "Dr. Williams", "Dr. Brown", 
  "Dr. Jones", "Dr. Miller", "Dr. Davis", "Dr. Wilson"
];

// API fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error('Failed to fetch doctors');
    throw error;
  }
  
  return response.json();
};

// Doctor suggestion item component
function DoctorSuggestion({ doctor, onSelect }: { 
  doctor: Doctor; 
  onSelect: (doctor: Doctor) => void; 
}) {
  return (
    <li>
      <button
        className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-100 last:border-b-0"
        onClick={() => onSelect(doctor)}
      >
        <div className="font-medium text-gray-900">{doctor.user.name}</div>
        <div className="text-sm text-gray-500">{doctor.specialization}</div>
        <div className="text-xs text-gray-400">{doctor.experienceYears} years experience</div>
      </button>
    </li>
  );
}

// Doctor card component
function DoctorCard({ doctor , router }: { doctor: Doctor , router : any }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xl font-semibold text-blue-600">
              {doctor.user.name.charAt(0)}
            </span>
          </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{doctor.user.name}</h3>
          <p className="text-sm text-gray-600">{doctor.specialization}</p>
          <p className="text-sm text-gray-600">{doctor.rating} rating</p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>{doctor.experienceYears} years experience</span>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
          </div>
          <div className="mt-4 flex space-x-2">
            <Button onClick={ () => router.push(`/patients/appointments/${doctor?.user?.id}/profile`) } size="sm">View Profile</Button>
            <Button variant="outline" size="sm">Book Appointment</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorSearch() {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  const specialtyFromUrl = searchParams.get('specialty') || '';
  const cityFromUrl = searchParams.get('city') || '';
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState<string>(queryFromUrl);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(specialtyFromUrl);
  const [selectedCity, setSelectedCity] = useState<string>(cityFromUrl);
  const [showNameSuggestions, setShowNameSuggestions] = useState<boolean>(true);

  // Update URL when search parameters change
  useEffect(() => {
    const url = new URL(window.location.href);
    
    if (debouncedSearchTerm) {
      url.searchParams.set('q', debouncedSearchTerm);
    } else {
      url.searchParams.delete('q');
    }
    
    if (selectedSpecialty) {
      url.searchParams.set('specialty', selectedSpecialty);
    } else {
      url.searchParams.delete('specialty');
    }
    
    if (selectedCity) {
      url.searchParams.set('city', selectedCity);
    } else {
      url.searchParams.delete('city');
    }
    
    window.history.replaceState({}, '', url.toString());
  }, [debouncedSearchTerm, selectedSpecialty, selectedCity]);

  // Use SWR to fetch doctors based on search parameters
  const { data, error, isLoading } = useSWR(
    debouncedSearchTerm || selectedSpecialty || selectedCity
      ? `/api/doctors/search?q=${encodeURIComponent(debouncedSearchTerm)}&specialty=${encodeURIComponent(selectedSpecialty)}&city=${encodeURIComponent(selectedCity)}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const doctors = data?.doctors || [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowNameSuggestions(true);
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    setSearchTerm(doctor.user.name);
    setSelectedDoctor(doctor);
    setShowSuggestions(false);
    setShowNameSuggestions(false);
    console.log("Selected doctor:", doctor);
  };

  const handleSelectNameSuggestion = (name: string) => {
    setSearchTerm(name);
    setShowNameSuggestions(false);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
      setShowNameSuggestions(false);
    }, 200);
  };

  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialty(value);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
  };

  const handleSearch = () => {
    setShowNameSuggestions(false);
    // Trigger search with current filters
  };

  return (
    <div className="mt-4 space-y-6 mx-auto">
      <div className="space-y-4">
        {/* Search and filters section */}
        <div className="flex  md:flex-row gap-4 w-1/2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search doctors by name..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="pl-10"
            />
            
            {/* Name suggestions dropdown */}
            {showNameSuggestions && searchTerm && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                <ul className="py-1 max-h-60 overflow-auto">
                  {nameSuggestions
                    .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((name, index) => (
                      <li key={index}>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                          onClick={() => handleSelectNameSuggestion(name)}
                        >
                          <div className="font-medium text-gray-900">{name}</div>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            
            {/* Doctor suggestions dropdown */}
            {showSuggestions && searchTerm && !showNameSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                {isLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                    Loading doctors...
                  </div>
                ) : error ? (
                  <div className="px-4 py-3 text-sm text-red-500">
                    Failed to load doctors. Please try again.
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No doctors found matching your search.
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-700">
                        {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} found
                      </div>
                    </div>
                    <ul className="py-1 max-h-80 overflow-auto">
                      {doctors.map((doctor: Doctor) => (
                        <DoctorSuggestion 
                          key={doctor.id} 
                          doctor={doctor} 
                          onSelect={handleSelectDoctor} 
                        />
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
          
          <Button onClick={handleSearch}>Search</Button>
        </div>
        
        {/* Filters section */}
        <div className="grid grid-cols-1 md:grid-cols-2 w-1/2   gap-4">
          <div>
            <Select value={selectedSpecialty} onValueChange={handleSpecialtyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Search results section */}
      {debouncedSearchTerm || selectedSpecialty || selectedCity ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Search Results
            {isLoading && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 inline-block"></div>
              </span>
            )}
          </h2>
          
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              Failed to load doctors. Please try again.
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">No doctors found matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor: Doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} router={router} />
              ))}
            </div>
          )}    
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Search for doctors by name, specialty, or location</p>
        </div>
      )}
      
      {/* Selected doctor details */}
      {selectedDoctor && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selected Doctor</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{selectedDoctor.user.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Specialty:</span>
              <span className="ml-2 text-gray-900">{selectedDoctor.specialization}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Experience:</span>
              <span className="ml-2 text-gray-900">{selectedDoctor.experienceYears} years</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}