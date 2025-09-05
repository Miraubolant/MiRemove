import React, { useState, useEffect } from 'react';
import { Calendar, Play, Download, RefreshCw, CheckCircle, AlertCircle, Users, Database } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MonthlyAggregationResult {
  success: boolean;
  target_month?: string;
  users_processed?: number;
  records_created?: number;
  execution_time?: string;
  error?: string;
  executed_at?: string;
}

interface MonthlyUsageRecord {
  user_id: string;
  email: string;
  group_name: string;
  bg_removal_count: number;
  resize_count: number;
  head_crop_count: number;
  total_operations: number;
  created_at: string;
}

export function MonthlyUsageManager() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<MonthlyAggregationResult | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Par défaut: mois précédent
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return lastMonth.toISOString().slice(0, 7); // YYYY-MM
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyUsageRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Charger les données du mois sélectionné
  const loadMonthlyData = async (yearMonth: string) => {
    setIsLoadingData(true);
    try {
      const { data, error } = await supabase.rpc('get_monthly_usage_with_details', {
        p_year_month: yearMonth
      });

      if (error) throw error;
      setMonthlyData(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données mensuelles:', error);
      setMonthlyData([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Charger les données au changement de mois
  useEffect(() => {
    loadMonthlyData(selectedMonth);
  }, [selectedMonth]);

  // Déclencher l'agrégation manuelle
  const triggerAggregation = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc('admin_trigger_monthly_aggregation', {
        p_year_month: selectedMonth
      });

      if (error) throw error;
      
      setLastResult(data);
      
      // Recharger les données après l'agrégation
      if (data?.success) {
        await loadMonthlyData(selectedMonth);
      }
    } catch (error) {
      console.error('Erreur lors de l\'agrégation:', error);
      setLastResult({
        success: false,
        error: error.message,
        executed_at: new Date().toISOString()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Export CSV
  const exportToCSV = () => {
    if (monthlyData.length === 0) return;

    const headers = ['Email', 'Groupe', 'Suppression Fond', 'Redimensionnement', 'Coupe Tête', 'Total Opérations', 'Date Création'];
    const csvContent = [
      headers.join(','),
      ...monthlyData.map(record => [
        `"${record.email}"`,
        `"${record.group_name}"`,
        record.bg_removal_count,
        record.resize_count,
        record.head_crop_count,
        record.total_operations,
        `"${new Date(record.created_at).toLocaleDateString('fr-FR')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usage_mensuel_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalOperations = monthlyData.reduce((sum, record) => sum + record.total_operations, 0);

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-emerald-400" />
        <h3 className="text-xl font-semibold text-white">Gestion Usage Mensuel</h3>
      </div>

      {/* Contrôles */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Mois :</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
            />
          </div>
          
          <button
            onClick={triggerAggregation}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isProcessing ? 'Traitement...' : 'Lancer Agrégation'}
          </button>

          {monthlyData.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>

        {/* Résultat de la dernière exécution */}
        {lastResult && (
          <div className={`p-4 rounded-lg border ${
            lastResult.success 
              ? 'bg-emerald-900/20 border-emerald-500/20' 
              : 'bg-red-900/20 border-red-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {lastResult.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm font-medium text-white">
                {lastResult.success ? 'Agrégation réussie' : 'Erreur d\'agrégation'}
              </span>
            </div>
            
            {lastResult.success ? (
              <div className="text-sm text-gray-300 space-y-1">
                <p>Mois traité: <span className="text-emerald-400">{lastResult.target_month}</span></p>
                <p>Utilisateurs traités: <span className="text-emerald-400">{lastResult.users_processed}</span></p>
                <p>Enregistrements créés: <span className="text-emerald-400">{lastResult.records_created}</span></p>
                <p>Temps d'exécution: <span className="text-emerald-400">{lastResult.execution_time}</span></p>
              </div>
            ) : (
              <p className="text-sm text-red-300">{lastResult.error}</p>
            )}
          </div>
        )}
      </div>

      {/* Statistiques du mois */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Utilisateurs Actifs</span>
          </div>
          <p className="text-2xl font-bold text-white">{monthlyData.length}</p>
        </div>
        
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-gray-400">Total Opérations</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalOperations.toLocaleString()}</p>
        </div>
        
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Mois</span>
          </div>
          <p className="text-2xl font-bold text-white">{selectedMonth}</p>
        </div>
      </div>

      {/* Tableau des données */}
      <div className="bg-slate-700/30 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-600">
          <h4 className="text-lg font-medium text-white">
            Données d'usage - {selectedMonth}
            {isLoadingData && <RefreshCw className="w-4 h-4 animate-spin inline-block ml-2" />}
          </h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-700/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Groupe</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">IA Fond</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Resize</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Crop Tête</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {monthlyData.map((record) => (
                <tr key={record.user_id} className="hover:bg-slate-700/20">
                  <td className="px-4 py-3 text-sm text-white">{record.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{record.group_name}</td>
                  <td className="px-4 py-3 text-sm text-right text-purple-400">{record.bg_removal_count}</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-400">{record.resize_count}</td>
                  <td className="px-4 py-3 text-sm text-right text-red-400">{record.head_crop_count}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-emerald-400">{record.total_operations}</td>
                </tr>
              ))}
              
              {monthlyData.length === 0 && !isLoadingData && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Aucune donnée pour ce mois
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}