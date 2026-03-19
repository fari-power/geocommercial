import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield } from 'lucide-react';

export default function Settings() {
    const { user } = useAuth();

    return (
        <div className="p-6 max-w-4xl">
            <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-200">
                {/* Profile */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profil
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-900">{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Sécurité
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Gérez vos paramètres de sécurité et de confidentialité.
                    </p>
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-medium rounded-lg transition-colors">
                        Changer le mot de passe
                    </button>
                </div>
            </div>
        </div>
    );
}
