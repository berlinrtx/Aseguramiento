import React, { useState } from 'react';
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from './lib/supabase';

const modes = { signIn: 'signIn', signUp: 'signUp', reset: 'reset' };

export default function AuthScreen() {
  const [mode, setMode] = useState(modes.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState('');

  const title = mode === modes.signIn ? 'Vuelve al trabajo' : mode === modes.signUp ? 'Crea tu espacio' : 'Recupera tu acceso';
  const description = mode === modes.signIn ? 'Continúa organizando el proyecto con evidencia visible.' : mode === modes.signUp ? 'Registra tu cuenta para empezar a construir con calidad.' : 'Te enviaremos un enlace seguro para crear una nueva contraseña.';

  function changeMode(nextMode) { setMode(nextMode); setError(''); setMessage(null); setPassword(''); }

  async function submit(event) {
    event.preventDefault(); setError(''); setMessage(null);
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setError('Escribe un correo electrónico válido.'); return; }
    if (mode !== modes.reset && password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (mode === modes.signUp && !name.trim()) { setError('Escribe tu nombre para crear el perfil.'); return; }
    setPending(true);
    try {
      if (mode === modes.signIn) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) throw signInError;
      } else if (mode === modes.signUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin } });
        if (signUpError) throw signUpError;
        if (!data.session) setMessage('Cuenta creada. Revisa tu correo para confirmar la dirección antes de iniciar sesión.');
      } else {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/` });
        if (resetError) throw resetError;
        setMessage('Te enviamos un enlace de recuperación. Revisa tu correo.');
      }
    } catch (authError) {
      setError(authError.message?.toLowerCase().includes('invalid login') ? 'El correo o la contraseña no son correctos.' : authError.message || 'No pudimos completar la solicitud. Intenta de nuevo.');
    } finally { setPending(false); }
  }

  return <main className="auth-shell"><section className="auth-story"><div className="auth-brand"><span className="brand-mark">A</span><div><strong>Atlas</strong><span>Aseguramiento</span></div></div><div className="auth-story-copy"><span className="eyebrow"><Sparkles size={12} />Espacio de trabajo</span><h1>La calidad también puede tener un lugar propio.</h1><p>Organiza requisitos, tareas y evidencia en un canvas diseñado para presentar el trabajo con claridad.</p></div><div className="auth-story-note"><ShieldCheck size={17} /><span>Sesiones protegidas por Supabase Auth</span></div></section><section className="auth-panel"><div className="auth-card"><div className="auth-card-top"><div className="auth-icon"><LockKeyhole size={19} /></div><span className="auth-kicker">Atlas / acceso</span></div><h2>{title}</h2><p className="auth-description">{description}</p>{error && <div className="auth-message auth-error" role="alert">{error}</div>}{message && <div className="auth-message auth-success" role="status"><Check size={15} />{message}</div>}<form onSubmit={submit} noValidate>{mode === modes.signUp && <label className="auth-field"><span>Nombre</span><div className="auth-input"><Sparkles size={15} /><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Tu nombre" /></div></label>}<label className="auth-field"><span>Correo electrónico</span><div className="auth-input"><Mail size={15} /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="nombre@ejemplo.com" /></div></label>{mode !== modes.reset && <label className="auth-field"><span>Contraseña</span><div className="auth-input"><LockKeyhole size={15} /><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete={mode === modes.signIn ? 'current-password' : 'new-password'} placeholder="Mínimo 8 caracteres" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>}{mode === modes.signIn && <button type="button" className="auth-link forgot" onClick={() => changeMode(modes.reset)}>¿Olvidaste tu contraseña?</button>}<button className="auth-submit" disabled={pending}>{pending ? 'Procesando…' : mode === modes.signIn ? 'Iniciar sesión' : mode === modes.signUp ? 'Crear cuenta' : 'Enviar enlace'}<ArrowRight size={16} /></button></form><div className="auth-switch">{mode === modes.signIn && <><span>¿Primera vez aquí?</span><button onClick={() => changeMode(modes.signUp)}>Crear cuenta</button></>}{mode === modes.signUp && <><span>¿Ya tienes cuenta?</span><button onClick={() => changeMode(modes.signIn)}>Iniciar sesión</button></>}{mode === modes.reset && <button onClick={() => changeMode(modes.signIn)}>Volver al inicio de sesión</button>}</div></div><div className="auth-footer">Acceso seguro · {new Date().getFullYear()} Atlas</div></section></main>;
}
