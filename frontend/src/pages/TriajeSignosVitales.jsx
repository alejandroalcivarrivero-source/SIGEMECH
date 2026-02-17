import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import pacienteService from '../api/pacienteService';
import { calcularEdad } from '../utils/calculosCronologicos';

const TriajeSignosVitales = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const paciente = location.state?.paciente;
    const [edad, setEdad] = useState(null);

    const [signosVitales, setSignosVitales] = useState({
        peso: '',
        talla: '',
        perimetro_cefalico: '',
        saturacion_oxigeno: '',
        presion_arterial: '',
        frecuencia_cardiaca: '',
        frecuencia_respiratoria: '',
        temperatura: '',
        imc: '',
        prioridad_color: ''
    });

    useEffect(() => {
        if (paciente && paciente.fecha_nacimiento) {
            const edadCalculada = calcularEdad(paciente.fecha_nacimiento);
            setEdad(edadCalculada);
        }
    }, [paciente]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignosVitales(prev => {
            const newSignosVitales = { ...prev, [name]: value };

            // Calcular IMC para adultos
            if (edad && edad.years >= 18) {
                const peso = parseFloat(newSignosVitales.peso);
                const talla = parseFloat(newSignosVitales.talla);
                if (peso > 0 && talla > 0) {
                    const tallaMetros = talla; // Asumiendo que la talla se ingresa en metros
                    newSignosVitales.imc = (peso / (tallaMetros * tallaMetros)).toFixed(2);
                } else {
                    newSignosVitales.imc = '';
                }
            }

            // Mapeo de colores basado en signos vitales (lógica de ejemplo)
            const { saturacion_oxigeno, presion_arterial, frecuencia_cardiaca, temperatura } = newSignosVitales;
            if (saturacion_oxigeno < 90 || temperatura > 38.5 || frecuencia_cardiaca > 100) {
                newSignosVitales.prioridad_color = 'Rojo';
            } else if (saturacion_oxigeno < 94 || temperatura > 37.5 || frecuencia_cardiaca > 90) {
                newSignosVitales.prioridad_color = 'Amarillo';
            } else {
                newSignosVitales.prioridad_color = 'Verde';
            }

            return newSignosVitales;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Lógica de validación y envío a la API
        console.log("Guardando signos vitales:", signosVitales);
        // await enfermeriaService.guardarTriaje(signosVitales);
        // navigate('/dashboard');
    };

    const renderCamposPorEdad = () => {
        if (!edad) return null;

        const { years } = edad;

        if (years < 5) {
            return (
                <>
                    <div>
                        <label>Peso (kg) *</label>
                        <input type="number" name="peso" value={signosVitales.peso} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Talla (cm) *</label>
                        <input type="number" name="talla" value={signosVitales.talla} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Perímetro Cefálico (cm) *</label>
                        <input type="number" name="perimetro_cefalico" value={signosVitales.perimetro_cefalico} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Saturación de Oxígeno (%) *</label>
                        <input type="number" name="saturacion_oxigeno" value={signosVitales.saturacion_oxigeno} onChange={handleChange} required />
                    </div>
                     <div>
                        <label>Presión Arterial</label>
                        <input type="text" name="presion_arterial" value={signosVitales.presion_arterial} onChange={handleChange} />
                    </div>
                </>
            );
        } else { // Adultos y otras edades intermedias
            return (
                <>
                    <div>
                        <label>Presión Arterial *</label>
                        <input type="text" name="presion_arterial" value={signosVitales.presion_arterial} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Frecuencia Cardíaca (lat/min) *</label>
                        <input type="number" name="frecuencia_cardiaca" value={signosVitales.frecuencia_cardiaca} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Frecuencia Respiratoria (resp/min) *</label>
                        <input type="number" name="frecuencia_respiratoria" value={signosVitales.frecuencia_respiratoria} onChange={handleChange} required />
                    </div>
                     <div>
                        <label>Saturación de Oxígeno (%) *</label>
                        <input type="number" name="saturacion_oxigeno" value={signosVitales.saturacion_oxigeno} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Temperatura (°C) *</label>
                        <input type="number" name="temperatura" value={signosVitales.temperatura} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Peso (kg) *</label>
                        <input type="number" name="peso" value={signosVitales.peso} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Talla (m) *</label>
                        <input type="number" name="talla" value={signosVitales.talla} onChange={handleChange} step="0.01" required />
                    </div>
                    <div>
                        <label>IMC</label>
                        <input type="text" name="imc" value={signosVitales.imc} readOnly />
                    </div>
                </>
            );
        }
        // Lógica para edades intermedias si es necesario
        return null; 
    };
    
    return (
        <div>
            <h2>Triaje y Signos Vitales</h2>
            {paciente && (
                <div>
                    <h3>Paciente: {paciente.nombres} {paciente.apellidos}</h3>
                    {edad && <p>Edad: {edad.years} años, {edad.months} meses, {edad.days} días</p>}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                {renderCamposPorEdad()}

                <div>
                    <label>Prioridad</label>
                    <select name="prioridad_color" value={signosVitales.prioridad_color} onChange={handleChange}>
                        <option value="">Seleccione</option>
                        <option value="Verde">Verde</option>
                        <option value="Amarillo">Amarillo</option>
                        <option value="Rojo">Rojo</option>
                    </select>
                </div>

                <button type="submit">Guardar Triaje</button>
            </form>
        </div>
    );
};

export default TriajeSignosVitales;
