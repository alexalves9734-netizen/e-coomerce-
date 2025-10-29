import React from "react";
import { assets } from "../assets/admin_assets/assets";
import { useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image4, setImage4] = useState(false);
  const [image3, setImage3] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Homens");
  const [subCategory, setSubCategory] = useState("Importados");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [sizePrices, setSizePrices] = useState({}); // Novo estado para preços por tamanho
  const [brand, setBrand] = useState("");
  const [intensity, setIntensity] = useState("");
  const [olfactiveFamily, setOlfactiveFamily] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [notes, setNotes] = useState([]);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("brand", brand);
      formData.append("intensity", intensity);
      formData.append("olfactiveFamily", JSON.stringify(olfactiveFamily));
      formData.append("occasions", JSON.stringify(occasions));
      formData.append("notes", JSON.stringify(notes));
      formData.append("bestseller", bestseller);
      formData.append("sizes", JSON.stringify(sizes));
      
      // Criar array de objetos com tamanho e preço
      const sizePricesArray = sizes.map(size => ({
        size: size,
        price: sizePrices[size] || Number(price)
      }));
      formData.append("sizePrices", JSON.stringify(sizePricesArray));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice("");
        setSizes([]);
        setSizePrices({});
        setBrand("");
        setIntensity("");
        setOlfactiveFamily([]);
        setOccasions([]);
        setNotes([]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col w-full items-start gap-3"
    >
      <div>
        <p className="mb-2">Carregar Imagem</p>
        <div className="flex gap-2">
          <label className="cursor-pointer" htmlFor="image1">
            <img
              className="w-20"
              src={!image1 ? assets.upload_area : URL.createObjectURL(image1)}
              alt="upload_area"
            />
            <input
              onChange={(e) => setImage1(e.target.files[0])}
              type="file"
              id="image1"
              hidden
            />
          </label>
          <label className="cursor-pointer" htmlFor="image2">
            <img
              className="w-20"
              src={!image2 ? assets.upload_area : URL.createObjectURL(image2)}
              alt="upload_area"
            />
            <input
              onChange={(e) => setImage2(e.target.files[0])}
              type="file"
              id="image2"
              hidden
            />
          </label>
          <label className="cursor-pointer" htmlFor="image3">
            <img
              className="w-20"
              src={!image3 ? assets.upload_area : URL.createObjectURL(image3)}
              alt="upload_area"
            />
            <input
              onChange={(e) => setImage3(e.target.files[0])}
              type="file"
              id="image3"
              hidden
            />
          </label>
          <label className="cursor-pointer" htmlFor="image4">
            <img
              className="w-20"
              src={!image4 ? assets.upload_area : URL.createObjectURL(image4)}
              alt="upload_area"
            />
            <input
              onChange={(e) => setImage4(e.target.files[0])}
              type="file"
              id="image4"
              hidden
            />
          </label>
        </div>
      </div>
      <div className="w-full">
        <p className="mb-2">Nome do Produto</p>
        <input
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Digite Aqui"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
        />
      </div>
      <div className="w-full">
        <p className="mb-2">Descrição do Produto</p>
        <textarea
          className="w-full max-w-[500px] px-3 py-2"
          type="text"
          placeholder="Adicionar Descrição do Produto"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          name="description"
          required
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <p className="mb-2">Categoria do Produto</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          className="w-full px-3 py-2"
        >
          <option value="Homens">Homens</option>
          <option value="Mulheres">Mulheres</option>
          <option value="Unissex">Unissex</option>
        </select>
      </div>
      <div>
          <p className="mb-2">Subcategoria</p>
          <select
            onChange={(e) => setSubCategory(e.target.value)}
            value={subCategory}
            className="w-full px-3 py-2"
          >
            <option value="Importados">Importados</option>
            <option value="Arabes">Árabes</option>
          </select>
        </div>
        <div>
          <p className="mb-2">Preço do Produto (Base)</p>
          <input
            className="w-full px-3 py-2 sm:w-[120px]"
            type="Number"
            placeholder="25"
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            required
          />
        </div>
      </div>
      <div className="w-full grid sm:grid-cols-2 gap-6">
        <div>
          <p className="mb-2">Marca / Fabricante</p>
          <input
            className="w-full max-w-[500px] px-3 py-2"
            type="text"
            placeholder="Ex.: Lattafa, Jean Paul Gaultier"
            onChange={(e) => setBrand(e.target.value)}
            value={brand}
          />
        </div>
        <div>
          <p className="mb-2">Intensidade</p>
          <select
            className="w-full px-3 py-2"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="Eau de Toilette">Eau de Toilette</option>
            <option value="Eau de Parfum">Eau de Parfum</option>
            <option value="Parfum">Parfum</option>
            <option value="Perfume Oil">Perfume Oil</option>
          </select>
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Família Olfativa</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {["Amadeirado","Oriental","Âmbar","Floral","Cítrico","Doce","Gourmand","Fresco"].map((fam) => (
            <label key={fam} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={olfactiveFamily.includes(fam)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setOlfactiveFamily((prev) => [...prev, fam]);
                  } else {
                    setOlfactiveFamily((prev) => prev.filter((f) => f !== fam));
                  }
                }}
              />
              {fam}
            </label>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Ocasião</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {["Uso diário","Festas / Noite","Climas frios","Climas quentes","Presentes"].map((opt) => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={occasions.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setOccasions((prev) => [...prev, opt]);
                  } else {
                    setOccasions((prev) => prev.filter((o) => o !== opt));
                  }
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2">Notas dominantes</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {["Baunilha","Âmbar","Rosa","Oud","Almíscar","Cítricos"].map((note) => (
            <label key={note} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notes.includes(note)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setNotes((prev) => [...prev, note]);
                  } else {
                    setNotes((prev) => prev.filter((n) => n !== note));
                  }
                }}
              />
              {note}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2">Tamanhos do Produto</p>
        <div className="flex gap-3">
          <div
            onClick={() =>
              setSizes((prev) =>
                prev.includes("5ML")
                  ? prev.filter((item) => item !== "5ML")
                  : [...prev, "5ML"]
              )
            }
          >
            <p
              className={`${
                sizes.includes("5ML") ? "bg-pink-100" : "bg-slate-200"
              } px-3 py-1 cursor-pointer`}
            >
              5ML
            </p>
          </div>
          <div
            onClick={() =>
              setSizes((prev) =>
                prev.includes("10ML")
                  ? prev.filter((item) => item !== "10ML")
                  : [...prev, "10ML"]
              )
            }
          >
            <p
              className={`${
                sizes.includes("10ML") ? "bg-pink-100" : "bg-slate-200"
              } px-3 py-1 cursor-pointer`}
            >
              10ML
            </p>
          </div>
        </div>
      </div>
      
      {/* Seção para preços específicos por tamanho */}
      {sizes.length > 0 && (
        <div>
          <p className="mb-2">Preços por Tamanho</p>
          <div className="flex flex-col gap-2">
            {sizes.map((size) => (
              <div key={size} className="flex items-center gap-2">
                <label className="w-16 text-sm">{size}:</label>
                <input
                  className="px-3 py-2 w-24"
                  type="number"
                  placeholder={price || "0"}
                  value={sizePrices[size] || ""}
                  onChange={(e) => 
                    setSizePrices(prev => ({
                      ...prev,
                      [size]: Number(e.target.value)
                    }))
                  }
                />
                <span className="text-sm text-gray-500">
                  {!sizePrices[size] && price ? `(usando preço base: ${price})` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type="checkbox"
          id="bestseller"
        />
        <label className="cursor-pointer" htmlFor="bestseller">
          Adicionar aos mais vendidos
        </label>
      </div>
      <button className="w-28 py-3 mt-4 bg-black text-white" type="submit">
        ADICIONAR
      </button>
    </form>
  );
};

export default Add;
