import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';

import './styles.css';

import logo from '../../assets/logo.svg';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import DropZone from '../../components/Dropzone';

import api from '../../services/api';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [file, setFile] = useState<File>();

  const [uf, setUf] = useState<string>("0");
  const [city, setCity] = useState<string>("0");
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([0, 0]);
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition([latitude, longitude]);
    })
  }, []);

  useEffect(() => {
    api.get('items').then(response => {
      console.log(response);
      setItems(response.data);
    })
  }, []);

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(response => {
        const ufInitials = response.data.map(uf => uf.sigla);

        setUfs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if (uf === "0") {
      return;
    }
    console.log(uf);

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then(response => {
        const cityNames = response.data.map(city => city.nome);

        setCities(cityNames);
      });
  }, [uf]);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const selectUf = event.target.value;
    setUf(selectUf);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const selectCity = event.target.value;
    setCity(selectCity);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handeInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value })
  }

  function handleSelectItem(id: number) {
    const alteadySelected = selectedItems.findIndex(item => item === id);

    if (alteadySelected > -1) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);

    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }


  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const [latitude, longitude] = position;

    const data = new FormData();

    data.append('name',name);
    data.append('email',email);
    data.append('whatsapp',whatsapp);
    data.append('uf',uf);
    data.append('city',city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', selectedItems.join(','));

    if(file) {
      data.append('image', file);
    }

    await api.post('points', data).then(response => {
      if (response.status === 200) {
        alert('Ponto de coleta criado');
        history.push('/')
      } else {
        alert('Erro ao cadastrar ponto de coleta');
      }
    });

  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>


      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br />ponto de coleta</h1>

        <DropZone onFileUploaded={setFile} />


        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handeInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-Mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handeInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whats-app</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handeInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione um endereço no mapa</span>
          </legend>

          <Map center={currentPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
            </Marker>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={uf} onChange={handleSelectUf}>
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option value={uf} key={uf}>{uf}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="city">cidade</label>
              <select name="uf" id="uf" value={city} onChange={handleSelectCity}>
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => (
                  <option value={city} key={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Item de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt="Test" />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>

      </form>
    </div>
  )
};

export default CreatePoint;