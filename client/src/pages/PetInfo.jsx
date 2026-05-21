import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cat, Dog, Mars, Venus, Search, ChevronDown } from "lucide-react";
import QuoteLayout from "../components/QuoteLayout";
import "../styles/PetInfo.css";
import api from "../api";

const petAges = [
  "Less than 2 months",
  "2 to 11 months",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
  "6 years",
  "7 years",
  "8 years",
  "9 years",
  "10 years",
  "11 years",
  "12 years",
  "13+ years",
];

const breeds = [
  "Mixed Breed - Toy (< 10 lbs)",
  "Mixed Breed - Small (11-30 lbs)",
  "Mixed Breed - Medium (31-50 lbs)",
  "Mixed Breed - Large (51-90 lbs)",
  "Mixed Breed - Giant (> 90 lbs)",
  "Affenpinscher",
  "Afghan Hound",
  "Airedale Terrier",
  "Akita",
  "American Bulldog",
  "American Bully",
  "Australian Shepherd",
  "Beagle",
  "Bernedoodle",
  "Border Collie",
  "Boxer",
  "Bulldog",
  "Cane Corso",
  "Cavapoo",
  "Chihuahua",
  "Cocker Spaniel",
  "Dachshund",
  "Doberman Pinscher",
  "French Bulldog",
  "German Shepherd Dog",
  "Golden Retriever",
  "Goldendoodle",
  "Labrador Retriever",
  "Maltipoo",
  "Pomeranian",
  "Poodle - Standard",
  "Pug",
  "Rottweiler",
  "Shih Tzu",
  "Yorkshire Terrier",
  "Other Dog",
];

function PetInfo() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    petName: "",
    petSpecies: "",
    petSex: "",
    breed: "",
    age: "",
    zipCode: "",
    email: "",
    phone: "",
  });

  const [breedSearch, setBreedSearch] = useState("");
  const [showBreeds, setShowBreeds] = useState(false);

  const filteredBreeds = useMemo(() => {
    return breeds.filter((breed) =>
      breed.toLowerCase().includes(breedSearch.toLowerCase())
    );
  }, [breedSearch]);

  const updateField = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const selectBreed = (breed) => {
    updateField("breed", breed);
    setBreedSearch(breed);
    setShowBreeds(false);
  };

  const handleNext = async (e) => {
  e.preventDefault();

  const required = [
    "petName",
    "petSpecies",
    "petSex",
    "breed",
    "age",
    "zipCode",
    "email",
  ];

  const empty = required.find((item) => !form[item]);

  if (empty) {
    alert("Please complete all required fields before continuing.");
    return;
  }

  try {
    await api.post("/pet-info", form);
    localStorage.setItem("petInfo", JSON.stringify(form));
    navigate("/personal-info");
  } catch (error) {
    alert("Pet info save failed. Backend check karo.");
  }
};

  return (
    <QuoteLayout activeStep={1}>
      <main className="pet-info-wrap">
        <form className="pet-card" onSubmit={handleNext}>
          <h1>Your Customized Quote in Seconds</h1>
          <p>Tell us about your pet to prepare a personalized insurance quote.</p>

          <label>Pet’s Name*</label>
          <input
            value={form.petName}
            onChange={(e) => updateField("petName", e.target.value)}
            placeholder="Enter your pet’s name"
          />

          <div className="form-grid">
            <div>
              <label>Your pet’s species*</label>
              <div className="option-row">
                <button
                  type="button"
                  className={form.petSpecies === "Dog" ? "option active" : "option"}
                  onClick={() => updateField("petSpecies", "Dog")}
                >
                  <Dog size={22} /> Dog
                </button>
                <button
                  type="button"
                  className={form.petSpecies === "Cat" ? "option active" : "option"}
                  onClick={() => updateField("petSpecies", "Cat")}
                >
                  <Cat size={22} /> Cat
                </button>
              </div>
            </div>

            <div>
              <label>Your pet’s gender*</label>
              <div className="option-row">
                <button
                  type="button"
                  className={form.petSex === "Male" ? "option active" : "option"}
                  onClick={() => updateField("petSex", "Male")}
                >
                  <Mars size={22} /> Male
                </button>
                <button
                  type="button"
                  className={form.petSex === "Female" ? "option active" : "option"}
                  onClick={() => updateField("petSex", "Female")}
                >
                  <Venus size={22} /> Female
                </button>
              </div>
            </div>
          </div>

          <label>Your Pet’s Breed*</label>
          <div className="custom-breed">
            <div className="breed-input-row">
              <Search size={18} />
              <input
                value={breedSearch}
                onFocus={() => setShowBreeds(true)}
                onChange={(e) => {
                  setBreedSearch(e.target.value);
                  updateField("breed", "");
                  setShowBreeds(true);
                }}
                placeholder="Search or select breed"
              />
              <button
                type="button"
                onClick={() => setShowBreeds(!showBreeds)}
                className="breed-arrow"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {showBreeds && (
              <div className="breed-dropdown">
                {filteredBreeds.length > 0 ? (
                  filteredBreeds.map((breed) => (
                    <button
                      type="button"
                      key={breed}
                      onClick={() => selectBreed(breed)}
                    >
                      {breed}
                    </button>
                  ))
                ) : (
                  <p>No breed found</p>
                )}
              </div>
            )}
          </div>

          <div className="form-grid">
            <div>
              <label>Your Pet’s Age*</label>
              <select
                value={form.age}
                onChange={(e) => updateField("age", e.target.value)}
              >
                <option value="">Select age</option>
                {petAges.map((age) => (
                  <option key={age}>{age}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Zip Code*</label>
              <input
                value={form.zipCode}
                onChange={(e) => updateField("zipCode", e.target.value)}
                placeholder="Enter zip code"
              />
            </div>
          </div>

          <label>Email Address*</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Enter email"
          />

          <label>
            Phone Number <span className="optional-tag">optional</span>
          </label>
          <input
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="Enter phone number"
          />

          <button className="primary-quote-btn" type="submit">
            Continue
          </button>
        </form>
      </main>
    </QuoteLayout>
  );
}

export default PetInfo;